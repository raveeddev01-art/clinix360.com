defmodule StitchConnect.Web.Api.V1.AuthenticationController do
  use StitchConnect.Web, :controller
  alias Stitch.User.{Authentication}
  alias Stitch.Accounts.{Email, User}
  alias StitchConnect.Web.Api.V1.{AuthenticationView, UserView}
  action_fallback StitchConnect.Web.Api.FallbackController

  def submit_login(conn, %{"email" => email, "password" => password}) do
    team = conn.assigns.team

    case Authentication.validate_email_and_password(email, password, team) do
      false ->
        {:error, :not_authorized, "Email or password is incorrect."}

      %User{disabled: false} ->
        {:error, :not_authorized, "This account is disabled - contact your team admin."}

      user ->
        conn
        |> login_user(user)
        |> render(UserView, "login.json", user: user)
    end
  end

  def create_reset_password_token(conn, %{"email" => email}) do
    team = conn.assigns.team

    case Authentication.create_reset_password_token(team, email) do
      {:error, message} ->
        {:error, :not_authorized, message}

      {:ok, user} ->
        reset_link = AuthenticationView.reset_password_link(user, conn)
        Email.reset_password_email(user, reset_link)

        conn |> json(%{status: "ok"})
    end
  end

  def reset_password(conn, %{"token" => token, "password" => password}) do
    case Authentication.reset_password(token, password) do
      {:error, message} ->
        {:error, :not_authorized, message}

      {:ok, _} ->
        conn |> json(%{message: "Password was successfully changed"})
    end
  end
end
