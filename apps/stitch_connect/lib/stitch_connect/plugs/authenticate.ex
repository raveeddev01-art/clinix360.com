defmodule StitchConnect.Plug.Authenticate do
  import Plug.Conn
  alias Stitch.UserQueries

  def init(default), do: default

  def call(conn, _) do
    case get_session(conn, :current_user_token) do
      nil ->
        conn
        |> Phoenix.Controller.redirect(to: "/login")
        |> halt
      current_user_token ->
        case UserQueries.get_by_token(current_user_token) do
          nil ->
            conn
            |> clear_session
            |> Phoenix.Controller.redirect(to: "/login")
            |> halt
          %{disabled: false} = current_user ->
            if current_user.team_id == conn.assigns.team.id do
              conn
              |> assign(:current_user, current_user)
            else
              conn
              |> Phoenix.Controller.redirect(to: "/login")
              |> halt
            end
          %{disabled: true} ->
            unless conn.request_path == "/login" or conn.request_path == "/submit_login" do
              conn
              |> Phoenix.Controller.redirect(to: "/logged-out")
              |> halt
            end
        end
    end
  end
end
