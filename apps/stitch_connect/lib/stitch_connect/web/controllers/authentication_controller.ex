defmodule StitchConnect.Web.AuthenticationController do
  use StitchConnect.Web, :controller

  def index(conn, _params) do
    render conn, "index.html", subdomain: conn.private[:subdomain]
  end

  def login(conn, _params) do
    with %Stitch.Accounts.User{} = current_user <- get_session(conn, :current_user),
         %Stitch.Accounts.User{} = current_user <- Stitch.Accounts.get_for_team_id(current_user.id, conn.assigns.team.id) do
      default_group = Stitch.GroupQueries.default_group(current_user)
      redirect(conn, to: StitchConnect.Web.SubdomainRouter.Helpers.group_path(conn, :index, default_group.slug))
    else _error ->
      login_params = Poison.encode!(%{
        "teamName" => conn.private[:team_name],
        "teamSlug" => conn.private[:team_slug],
        "invalidLogin" => get_flash(conn, :invalid_login)
      })
      render conn, "login.html", login_params: login_params
    end
  end

  def submit_login(conn, %{"email" => email, "password" => password}) do
    team_slug = conn.private[:team_slug]
    case Stitch.User.Authentication.validate_email_and_password(email, password, team_slug) do
      false ->
        conn
        |> put_flash(:invalid_login, "Sorry, you entered an invalid email or password.")
        |> redirect(to: "/login")
      user ->
        case user.disabled do
          false ->
            conn
            |> login_user(user)
            |> redirect(to: "/")
          true ->
            conn
            |> put_flash(:invalid_login, "This account is disabled - contact your team admin.")
            |> redirect(to: "/login")
        end
    end
  end

  def logout(conn, _) do
    conn
    |> clear_session
    |> redirect(to: "/")
  end

  def reset_password(conn, _) do
    reset_password_params = Poison.encode!(%{
      "teamName" => conn.private[:team_name],
      "teamSlug" => conn.private[:team_slug]
    })
    render(conn, "reset_password.html", reset_password_params: reset_password_params)
  end

  def change_password(conn, %{"token" => token}) do
    case Stitch.User.Authentication.check_for_valid_reset_token(token) do
      false ->
        conn
        |> put_flash(:invalid_login, "Invalid Token.")
        |> redirect(to: "/login")

      user ->
        change_password_params = Poison.encode!(%{
          "teamName" => conn.private[:team_name],
          "teamSlug" => conn.private[:team_slug],
          "user_id"  => user.id,
          "token"    => token
        })
        render(conn, "change_password.html", change_password_params: change_password_params)
    end
  end
end
