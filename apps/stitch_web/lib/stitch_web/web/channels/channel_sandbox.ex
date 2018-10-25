defmodule Stitch.Web.ChannelSandbox do
  @moduledoc """
  Configures a normal Phoenix Channel to handle sandboxed SQL connections.
  """

  defmacro __using__(_) do
    quote do
      @before_compile unquote(__MODULE__)
    end
  end

  defmacro __before_compile__(_env) do
    quote do
      defoverridable join: 3

      def join(topic, params, socket) do
        socket = Stitch.Web.ChannelSandbox.enable_channel_sandbox(socket)
        super(topic, params, socket)
      end
    end
  end

  @doc """
  Perform an extra steps on the socket prior to using it in a channel.

  This function is intended to be called at to top of `join/3`.
  """
  def enable_channel_sandbox(
        %{assigns: %{sandbox_metadata: %{repo: repo, owner: owner}}} = socket
      ) do
    Ecto.Adapters.SQL.Sandbox.allow(repo, owner, self())
    socket
  end

  def enable_channel_sandbox(socket), do: socket
end
