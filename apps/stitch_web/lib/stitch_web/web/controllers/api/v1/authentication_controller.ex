defmodule Stitch.Web.Api.V1.AuthenticationController do
  use Stitch.Web, :controller
  alias Stitch.User.{Authentication}

  alias Stitch.{
    PatientQueries,
    UserQueries,
    Patient,
    PatientEmail
  }

  alias Stitch.Accounts.{Email, User, PasswordResetToken}
  alias Stitch.Web.Api.V1.UserView
  alias Stitch.Web.Api.V1.AuthenticationView
  alias Stitch.Web.EventsChannel

  action_fallback(Stitch.Web.Api.FallbackController)

  def submit_login(conn, %{"email" => email, "password" => password}) do
    team = conn.assigns.team

    case Authentication.validate_user_email_and_password(email, password, team) do
      false ->
        {:error, :not_authorized, "Email or password is incorrect."}

      %User{disabled: true} ->
        {:error, :not_authorized, "This account is disabled - contact your carespace admin."}

      user ->
        path = get_session(conn, :redirect_url) || "/apps"

        conn
        |> login_user(user)
        |> render(UserView, "login.json", %{user: user, redirect_url: path})
    end
  end

  # Given an email (as opposed to token/password)

  def reset_password(conn, %{"email" => email}) do
    team = conn.assigns.team

    with {:user, %User{} = user} <- {:user, UserQueries.team_member_with_email(team.id, email)},
         {:ok, password_reset_token} <- PasswordResetToken.create_for_user(user) do
      reset_link = AuthenticationView.reset_password_link(password_reset_token, conn)
      Email.reset_password_email(user, reset_link)
      conn |> json(%{status: "ok"})
    else
      any -> handle_email_reset_with(any)
    end
  end

  def patient_reset_password(conn, %{"email" => email}) do
    team = conn.assigns.team

    with {:patient, %Patient{} = patient} <-
           {:patient, PatientQueries.team_member_with_email(team.id, email)},
         {:ok, password_reset_token} <- PasswordResetToken.create_for_patient(patient) do
      reset_link = AuthenticationView.reset_password_link(password_reset_token, conn)
      PatientEmail.send_reset_password(patient, reset_link)
      conn |> json(%{status: "ok"})
    else
      any -> handle_email_reset_with(any)
    end
  end

  defp handle_email_reset_with({:user, nil}) do
    {:error, :not_authorized, "User is not part of the team or email does not exist"}
  end

  defp handle_email_reset_with({:patient, nil}) do
    {:error, :not_authorized, "Patient is not part of the team or email does not exist"}
  end

  defp handle_email_reset_with({:error, changeset}) do
    {:error, changeset}
  end

  # Given a token & password (as opposed to an email)

  def reset_password(conn, %{"token" => token, "password" => password}) do
    team = conn.assigns.team

    with {:token, %PasswordResetToken{} = token} <-
           {:token, PasswordResetToken.get_valid_token(token)},
         {:team_member?, true} <- {:team_member?, token.user.team_id == team.id},
         {:ok, %{user: user}} <- Authentication.reset_password(token.user, password) do
      EventsChannel.broadcast_logout_from_all_sessions(user)
      json(conn, %{message: "Password was successfully changed"})
    else
      any -> handle_token_reset_with(any)
    end
  end

  def patient_reset_password(conn, %{"token" => token, "password" => password}) do
    team = conn.assigns.team

    with {:token, %PasswordResetToken{} = token} <-
           {:token, PasswordResetToken.get_valid_token(token)},
         {:team_member?, true} <- {:team_member?, token.patient.team_id == team.id},
         {:ok, %{patient: patient}} <- Authentication.reset_password(token.patient, password) do
      json(conn, %{message: "Password was successfully changed"})
    else
      any -> handle_token_reset_with(any)
    end
  end

  defp handle_token_reset_with({:token, nil}) do
    {:error, :not_found, "Token is invalid or already used"}
  end

  defp handle_token_reset_with({:team_member?, false}) do
    {:error, :not_found, "Token is invalid or already used"}
  end

  defp handle_token_reset_with({:error, :patient, changeset, _}), do: {:error, changeset}
  defp handle_token_reset_with({:error, :user, user_changeset, _}), do: {:error, user_changeset}
  defp handle_token_reset_with(_), do: {:error, :not_found}
end
