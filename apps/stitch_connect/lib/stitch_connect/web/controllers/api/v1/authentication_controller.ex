defmodule StitchConnect.Web.Api.V1.AuthenticationController do
  use StitchConnect.Web, :controller

  def submit_login(conn, %{"email" => email, "password" => password}) do
    team_slug = conn.private[:team_slug]
    case Stitch.User.Authentication.validate_email_and_password(email, password, team_slug) do
      false ->
        conn
        |> put_status(403)
        |> json(%{message: "Email or password is incorrect."})
      user ->
        case user.disabled do
          false ->
            render conn, StitchConnect.Web.Api.V1.UserView, "login.json", user: user
          true ->
            conn
            |> put_status(403)
            |> json(%{message: "This account is disabled - contact your team admin."})
        end
    end
  end

  def web_login(conn, %{"email" => email, "password" => password}) do
    team_slug = conn.private[:team_slug]
    case Stitch.User.Authentication.validate_email_and_password(email, password, team_slug) do
      false ->
        conn
        |> put_status(403)
        |> json(%{message: "Email or password is incorrect."})
      user ->
        case user.disabled do
          false ->
            conn
            |> login_user(user)
            |> render(StitchConnect.Web.Api.V1.UserView, "login.json", user: user)
          true ->
            conn
            |> put_status(403)
            |> json(%{message: "This account is disabled - contact your team admin."})
        end
    end
  end

  def reset_password(conn, %{"email" => email}) do
    team_slug = conn.private[:team_slug]
    case Stitch.User.Authentication.create_reset_password_token_for_user(email, team_slug) do
      {:error, message} ->
        conn
        |> put_status(403)
        |> json(%{message: message})

      {:ok, user} ->
        Stitch.Accounts.Email.reset_password_email(user, StitchConnect.Web.Api.V1.AuthenticationView.reset_password_link(user, conn))
        conn |> json(%{status: "ok"})
    end
  end

  def reset_password(conn, %{"token" => token, "password" => password}) do
    case Stitch.User.Authentication.reset_password_for_user(token, password) do
      {:error, message} ->
        conn
        |> put_status(403)
        |> json(%{message: message})
      {:ok, _} ->
        conn |> json(%{message: "Password was successfully changed"})
    end
  end
end
