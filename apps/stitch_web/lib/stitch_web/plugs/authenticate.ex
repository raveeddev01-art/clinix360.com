defmodule Stitch.Web.Plug.Authenticate do
  import Plug.Conn
  alias Stitch.UserQueries
  alias Stitch.Accounts.User
  alias Stitch.Web.ControllerHelpers

  def init(default), do: default

  def call(conn, _) do
    with {:token, token} when is_binary(token) <-
           {:token, ControllerHelpers.get_session_token(conn)},
         {:user, %User{disabled: false} = user} <- {:user, UserQueries.get_by_token(token)},
         {:team_member?, true} <- {:team_member?, user.team_id == conn.assigns.team.id} do
          IO.inspect("here in plug")
      conn
      |> assign(:current_user, user)
      |> ControllerHelpers.create_access_log_record(user)
    else
      {:token, nil} ->
        force_login(conn)

      {:user, nil} ->
        force_login(conn)

      {:user, _disabled_user} ->
        handle_disabled_user(conn)

      {:team_member?, false} ->
        force_login(conn)
    end
  end

  def force_login(conn) do
    conn
    |> Plug.Conn.put_session(:redirect_url, conn.request_path)
    |> Phoenix.Controller.redirect(to: "/login")
    |> halt
  end

  def handle_disabled_user(conn) do
    unless conn.request_path == "/login" or conn.request_path == "/submit_login" do
      conn
      |> Phoenix.Controller.redirect(to: "/logged-out")
      |> halt
    else
      conn
    end
  end
end
