defmodule Stitch.Util.Sanitizer do
  @moduledoc """
  Sanitizer functions for Stitch data.
  """

  @doc """
  Lowercases a string and removes all non-alphanumeric characters.
  """
  @spec keep_lower_alphanumeric(binary) :: binary
  def keep_lower_alphanumeric(username) when is_binary(username) do
    username =
      username
      |> String.downcase()
      |> String.replace(~r/[^a-z0-9]/, "")

    if String.length(username) == 1, do: "#{username}_", else: username
  end
end
