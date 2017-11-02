defmodule StitchConnect.Plug.Authenticate do
  import Plug.Conn

  def init(default), do: default

  def call(conn, _) do
    case get_session(conn, :current_user) do
      %Stitch.Accounts.User{} = user ->
        if conn.assigns.team && (user.team_id == conn.assigns.team.id) do
          conn
        else
          conn
          |> Phoenix.Controller.redirect(to: "/login")
          |> halt
        end
      _ ->
        conn
        |> Phoenix.Controller.redirect(to: "/login")
        |> halt
    end
  end
end
