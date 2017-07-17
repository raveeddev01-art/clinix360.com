defmodule StitchConnect.Plug.Authenticate do
  import Plug.Conn

  def init(default), do: default

  def call(conn, _) do
    case get_session(conn, :current_user) do
      nil ->
        conn
        |> Phoenix.Controller.redirect(to: "/login")
        |> halt
      _ ->
        conn
    end
  end
end