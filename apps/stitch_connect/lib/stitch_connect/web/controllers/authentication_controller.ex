defmodule StitchConnect.Web.AuthenticationController do
  use StitchConnect.Web, :controller

  def index(conn, _params) do
    render conn, "index.html", subdomain: conn.private[:subdomain]
  end

  def login(conn, _params) do
    login_params = Poison.encode!(%{
      "teamName" => conn.private[:team_name],
      "teamSlug" => conn.private[:team_slug],
      "invalidLogin" => get_flash(conn, :invalid_login)
    })
    render conn, "login.html", login_params: login_params
  end

  def submit_login(conn, %{"email" => email, "password" => password}) do
    team_slug = conn.private[:team_slug]
    case Stitch.User.Authentication.validate_email_and_password(email, password, team_slug) do
      false ->
        conn
        |> put_flash(:invalid_login, "Invalid email or password.")
        |> redirect to: "/login"
      user ->
        conn
        |> put_session(:current_user, user)
        |> put_session(:authentication_token, user.token)
        |> redirect to: "/"
    end
  end
end
