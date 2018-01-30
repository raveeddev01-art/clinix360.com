defmodule Stitch.Util.Sanitizer do
  @moduledoc """
  Sanitizer functions for Stitch data.
  """

  @doc """
  Lowercases a string and removes all non-alphanumeric characters.
  """
  @spec keep_lower_alphanumeric(binary) :: binary
  def keep_lower_alphanumeric(value, min_size \\ 2)
  def keep_lower_alphanumeric(value, min_size) when is_binary(value) do
    value
    |> String.downcase()
    |> String.replace(~r/[^a-z0-9]/, "")
    |> String.pad_trailing(min_size, "0")
  end
  def keep_lower_alphanumeric(_value, _min_size), do: {:error, "value must be a string"}
end
