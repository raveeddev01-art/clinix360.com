#TODO - This is copy and pasted from the authenticate plug.
defmodule StitchConnect.Plug.ApiAuthenticate do
  import Plug.Conn

  def init(default), do: default

  def call(conn, _) do
    case get_session(conn, :current_user_id) do
      nil ->
        conn
        |> Phoenix.Controller.redirect(to: "/login")
        |> halt
      _ ->
        conn
    end
  end
end