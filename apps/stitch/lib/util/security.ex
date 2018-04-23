defmodule Stitch.Util.Security do
  @moduledoc """
  Security functions that we can use on Stitch.
  """

  @doc """
  Generates a random 32 character websafe string.
  """
  @spec websafe_string() :: binary
  def websafe_string do
    :crypto.strong_rand_bytes(36) |> Base.url_encode64() |> binary_part(0, 36)
  end
end
