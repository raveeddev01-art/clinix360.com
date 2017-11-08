defmodule Stitch.Analytics.Sync do
  @moduledoc """
  Synchronizes analytics events in Stitch DB with remote analytics store.

  In production the remote analytics store is Segment (https://segment.com/).

  """

  alias Stitch.Analytics

  @segment_api Application.get_env(:stitch, :segment_api)

  def perform() do
    batches = get_batches()
    process_batches(batches)
  end

  defp get_batches do
    # Segment suggests a maximum of 50 requests per second. They also suggest
    # a maximum of 500kb per batch and 32kb per call.
    #
    # For more information visit:
    # https://segment.com/docs/sources/server/http/#rate-limits
    #
    # With a limit of 5_000 and chunks of 100 requests we make sure we follow
    # Segment's rate limit and max request size requirements.
    #

    [limit: 5_000]
    |> Analytics.list_events()
    |> Enum.chunk_every(100)
  end

  defp process_batches(batches) do
    Analytics.Sync.Supervisor
    |> Task.Supervisor.async_stream_nolink(batches, &(process_batch(&1)))
    |> Enum.reduce([], fn(result, acc_results) -> [result | acc_results] end)
  end

  defp process_batch(batch) do
    payload = batch_to_payload(batch)
    case @segment_api.batch(payload) do
      {:ok, _} -> Analytics.delete_events(batch)
      error -> error
    end
  end

  defp batch_to_payload(batch) do
    batch
    |> Enum.map(&(&1.payload))
    |> (fn requests -> %{batch: requests} end).()
    |> Poison.encode!()
  end

end
