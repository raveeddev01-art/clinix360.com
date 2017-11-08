defmodule Stitch.Analytics.Segment do
  @moduledoc """
  Defines interface for expected interactions with Segment
  (https://segment.com/).

  """

  @doc """
  Let's us send a series of identify, group, track, page and screen requests
  in a single batch, saving on outbound requests.

  """
  @callback batch(payload :: String.t) :: {:ok, term} | {:error, term}
end
