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

  @doc false
  def test_setup do
    StitchConnect.MessageLinkPreview.Supervisor
    |> Supervisor.which_children()
    |> Enum.map(fn {_mod, pid, _kind, _args} ->
      Ecto.Adapters.SQL.Sandbox.allow(Stitch.Repo, self(), pid)
    end)
  end
end
