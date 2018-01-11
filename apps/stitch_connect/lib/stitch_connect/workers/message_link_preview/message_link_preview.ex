defmodule StitchConnect.MessageLinkPreview do
  @moduledoc """
  Handles message link preview generation.
  """

  alias StitchConnect.MessageLinkPreview.Generator

  @doc """
  Queues a message for link preview generation with overload protection.

  ## Examples

      iex> StitchConnect.MessageLinkPreview.queue(message)
      :ok

      iex> StitchConnect.MessageLinkPreview.queue(message)
      {:error, :buffer_limit_reached, 50}
  """
  def queue(message) do
    Generator.queue(message)
  end
  def queue(name, message) do
    Generator.queue(name, message)
  end
end
