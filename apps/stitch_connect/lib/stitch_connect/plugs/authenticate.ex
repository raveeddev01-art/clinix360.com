defmodule StitchConnect.Plug.Authenticate do
  import Plug.Conn
  alias Stitch.Accounts
  alias Stitch.Accounts.User

  def init(default), do: default

  def call(conn, _) do
    case get_session(conn, :current_user) do
      %User{id: user_id} ->
        case Accounts.get_by_id(user_id) do
          nil ->
            conn
            |> clear_session
            |> Phoenix.Controller.redirect(to: "/login")
            |> halt
          current_user ->
            if current_user.team_id == conn.assigns.team.id do
              conn
              |> assign(:current_user, current_user)
            else
              conn
              |> Phoenix.Controller.redirect(to: "/login")
              |> halt
            end
        end
      _ ->
        conn
        |> Phoenix.Controller.redirect(to: "/login")
        |> halt
    end
  end
end
