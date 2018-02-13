defmodule StitchConnect.Plug.Authenticate do
  import Plug.Conn
  alias Stitch.UserQueries
  alias Stitch.Accounts.User

  def init(default), do: default

  def call(conn, _) do
    with {:token, token} when is_binary(token) <- {:token, get_session(conn, :current_user_token)},
         {:user, %User{disabled: false} = user} <- {:user, UserQueries.get_by_token(token)},
         {:team_member?, true} <- {:team_member?, user.team_id == conn.assigns.team.id} do
      assign(conn, :current_user, user)
    else
      {:token, nil} -> force_login(conn)
      {:user, nil} -> force_login(conn)
      {:user, _disabled_user} -> handle_disabled_user(conn)
      {:team_member?, false} -> force_login(conn)
    end
  end

  def force_login(conn) do
    conn
    |> clear_session
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
