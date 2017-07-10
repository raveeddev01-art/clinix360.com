defmodule StitchConnect.Web.AuthenticationController do
  use StitchConnect.Web, :controller

  def index(conn, _params) do
    render conn, "index.html", subdomain: conn.private[:subdomain]
  end

  def login(conn, _params) do
    login_params = Poison.encode!(%{
      "teamName" => conn.private[:team_name],
      "teamSlug" => conn.private[:team_slug]
    })
    render conn, "login.html", login_params: login_params
  end

  def submit_login(conn, %{"email" => email, "password" => password}) do
    team_slug = conn.private[:team_slug]
    case Stitch.User.Authentication.validate_email_and_password(email, password, team_slug) do
      false ->
        redirect conn, to: "/login"
      user ->
        put_session(conn, :current_user_id, user.id)
        |> redirect to: "/"
    end
  end
end
