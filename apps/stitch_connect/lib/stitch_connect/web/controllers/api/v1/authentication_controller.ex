defmodule StitchConnect.Web.Api.V1.AuthenticationController do
  use StitchConnect.Web, :controller
  alias Stitch.User.{Authentication}
  alias Stitch.UserQueries
  alias Stitch.Accounts.{Email, User, PasswordResetToken}
  alias StitchConnect.Web.Api.V1.{AuthenticationView, UserView}
  alias StitchConnect.Web.{EventsChannel}
  action_fallback StitchConnect.Web.Api.FallbackController

  def submit_login(conn, %{"email" => email, "password" => password}) do
    team = conn.assigns.team

    case Authentication.validate_email_and_password(email, password, team) do
      false ->
        {:error, :not_authorized, "Email or password is incorrect."}

      %User{disabled: true} ->
        {:error, :not_authorized, "This account is disabled - contact your team admin."}

      user ->
        conn
        |> login_user(user)
        |> render(UserView, "login.json", user: user)
    end
  end

  def reset_password(conn, %{"email" => email}) do
    team = conn.assigns.team

    with {:user, %User{} = user} <- {:user, UserQueries.team_member_with_email(team.id, email)},
         {:ok, password_reset_token} <- PasswordResetToken.create_for_user(user) do
      reset_link = AuthenticationView.reset_password_link(password_reset_token, conn)
      Email.reset_password_email(user, reset_link)
      conn |> json(%{status: "ok"})
    else
      {:user, nil} -> {:error, :not_authorized, "User is not part of the team or email does not exist"}
      {:error, changeset} -> {:error, changeset}
    end
  end

  def reset_password(conn, %{"token" => token, "password" => password}) do
    team = conn.assigns.team

    with {:token, %PasswordResetToken{} = token} <- {:token, PasswordResetToken.get_valid_token(token)},
         {:team_member?, true} <- {:team_member?, token.user.team_id == team.id},
         {:ok, %{user: user}} <- Authentication.reset_password(token.user, password) do
      EventsChannel.broadcast_logout_from_all_sessions(user)
      json(conn, %{message: "Password was successfully changed"})
    else
      {:token, nil} -> {:error, :not_found, "Token is invalid or already used"}
      {:team_member?, false} -> {:error, :not_found, "Token is invalid or already used"}
      {:error, :user, user_changeset, _} -> {:error, user_changeset}
      _ -> {:error, :not_found}
    end
  end
end
