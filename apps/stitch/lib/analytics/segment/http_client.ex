defmodule Stitch.Analytics.Segment.HTTPClient do
  @moduledoc """
  Functions for interacting with Segment (https://segment.com/).

  """

  @behaviour Stitch.Analytics.Segment

  @batch_endpoint "https://api.segment.io/v1/batch"

  @impl Stitch.Analytics.Segment
  def batch(payload) do
    HTTPoison.post(@batch_endpoint, payload, headers())
  end

  defp headers() do
    ["Authorization": "Basic #{encoded_key()}", "Content-Type": "application/json"]
  end

  defp encoded_key() do
    "SEGMENT_WRITE_KEY"
    |> System.get_env()
    |> Base.encode64()
  end
end
