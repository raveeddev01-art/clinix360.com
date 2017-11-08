defmodule Stitch.Analytics.Segment.InMemory do
  @moduledoc """
  Meant to be used when in test environment.

  """

  @behaviour Stitch.Analytics.Segment

  @impl Stitch.Analytics.Segment
  def batch(payload) do
    post_payload(payload)
    {:ok, payload}
  end

  @name __MODULE__

  defp start(name \\ @name) do
    Agent.start(fn -> [] end, name: name)
  end

  defp post_payload(new_payload, pid \\ @name) do
    start() # incase it wasn't started yet
    Agent.update(pid, fn(payloads) -> [new_payload | payloads] end)
  end

  @doc false
  def list_all(pid \\ @name) do
    start() # incase it wasn't started yet
    Agent.get(pid, fn(payloads) -> payloads end)
  end

end
