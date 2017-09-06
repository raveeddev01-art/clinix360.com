defmodule StitchConnect.Plug.Authenticate do
  import Plug.Conn

  def init(default), do: default

  def call(conn, _) do
    case get_session(conn, :current_user) do
      %Stitch.Accounts.User{} ->
        conn
      _ ->
        conn
        |> Phoenix.Controller.redirect(to: "/login")
        |> halt
    end
  end
end
