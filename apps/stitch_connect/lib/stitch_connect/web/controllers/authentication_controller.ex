defmodule StitchConnect.Web.AuthenticationController do
  use StitchConnect.Web, :controller
  alias StitchConnect.Web.{EventsChannel}

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

  def auto_login(conn, %{"token" => token}) do
    with %Stitch.FindYourTeam.Token{} = token <- Stitch.FindYourTeam.get_login_token(token),
         %Stitch.Accounts.User{} = user <- Stitch.UserQueries.team_member_with_email(conn.assigns.team.id, token.email),
         {:ok, _token} <- Stitch.FindYourTeam.delete_token(token) do
      default_group = Stitch.GroupQueries.default_group(user)
      conn
      |> login_user(user)
      |> redirect(to: StitchConnect.Web.SubdomainRouter.Helpers.group_path(conn, :index, default_group.slug))
    else _error ->
      render conn, "auto_login_error.html"
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
            |> redirect(to: "/apps")
          true ->
            conn
            |> put_flash(:invalid_login, "This account is disabled - contact your team admin.")
            |> redirect(to: "/login")
        end
    end
  end

  def logout(conn, _) do
    session_id = get_session(conn, :session_id)

    conn
    |> configure_session(drop: true)
    |> broadcast_logout(session_id)
    |> redirect(to: "/logged-out")
  end

  def logged_out(conn, _) do
    logged_out_params = Poison.encode!(%{
      "teamName" => conn.private[:team_name],
      "teamSlug" => conn.private[:team_slug]
    })
    conn
    |> configure_session(drop: true)
    |> render("logged_out.html", logged_out_params: logged_out_params)
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

  defp broadcast_logout(conn, session_id) do
    EventsChannel.broadcast_logout(conn.assigns.current_user, session_id)
    conn
  end

  def apps(conn, _) do
    apps_page_params = Poison.encode!(%{
      "teamName" => conn.private[:team_name],
      "teamSlug" => conn.private[:team_slug]
    })
    render(conn, "apps_page.html", apps_page_params: apps_page_params)
  end
end
