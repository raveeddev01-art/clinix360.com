defmodule Stitch.Util.Sanitizer do
  @moduledoc """
  Sanitizer functions for Stitch data.
  """

  @doc """
  Finds a user by id based on a user.
  """
  @spec keep_lower_alphanumeric(binary) :: binary
  def keep_lower_alphanumeric(username) when is_binary(username) do
    username =
      username
      |> String.downcase()
      |> String.replace(~r/[^a-z0-9\.\-_]/, "")

    if String.length(username) == 1, do: "#{username}_", else: username
  end
end
