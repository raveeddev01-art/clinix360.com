defmodule StitchConnect.Web.ChannelSandbox do
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
        socket = StitchConnect.Web.ChannelSandbox.enable_channel_sandbox(socket)
        super(topic, params, socket)
      end
    end
  end

  @doc """
  Perform an extra steps on the socket prior to using it in a channel.

  This function is intended to be called at to top of `join/3`.
  """
  def enable_channel_sandbox(%{assigns: %{sandbox_owner: %{repo: repo, owner: owner}}} = socket) do
    Ecto.Adapters.SQL.Sandbox.allow(repo, owner, self())
    socket
  end
  def enable_channel_sandbox(socket), do: socket

  @doc """
  Configures a socket to configure sandbox information for channels to consume.
  """
  if Application.get_env(:stitch_connect, :sql_sandbox) do
    def configure_channel_sandbox(%{"owner" => owner}, socket) do
      sandbox_owner =
        owner
        |> Base.url_decode64!()
        |> :erlang.binary_to_term()
      %{repo: repo, owner: owner} = sandbox_owner
      Ecto.Adapters.SQL.Sandbox.allow(repo, owner, self())
      Phoenix.Socket.assign(socket, :sandbox_owner, sandbox_owner)
    end
  end
  def configure_channel_sandbox(_, socket), do: socket
end
