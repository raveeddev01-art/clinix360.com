defmodule Stitch.Web.Api.V1.FindYourTeamController do
  use Stitch.Web, :controller
  use Stitch.Web.Api.V1.FindYourTeamDocs

  alias Stitch.{
    FindYourTeam,
    PatientEmail,
    TeamQueries
  }

  alias Stitch.Accounts.{User}

  action_fallback(Stitch.Web.Api.FallbackController)

  def create(conn, %{"email" => email}) do
    IO.puts "I AM IN CREATE"
    # case FindYourTeam.create_team_list_token(email) do
      # {:ok, token} -> 
        IO.puts "TOKEN AYAA"
        # FindYourTeam.Email.email()
        Stitch.Accounts.Email.role_changed_email(%User{email: "hashim.sohail@invozone.com", first_name: "Hashim"}, ["member"], ["multi-room-guest"])
      # _ -> 
        # IO.puts "NO TOKEN"
    #     nil
    # end

    json(conn, %{message: "Email has been sent to #{email}. Please check your inbox."})
  end

  def patient_create(conn, %{"email" => email}) do
    IO.puts "I AM HEREEE"
    case FindYourTeam.create_patient_team_list_token(email) do
      {:ok, token} -> PatientEmail.send_find_team(email, token)
      _ -> nil
    end

    json(conn, %{message: "Email has been sent to #{email}. Please check your inbox."})
  end

  def delete(conn, %{"token" => token}) do
    with {:ok, %{login_token: login_token}} <- FindYourTeam.create_login_token(token) do
      teams = TeamQueries.all_with_user_email(login_token.email)
      render(conn, "teams.json", teams: teams, login_token: login_token)
    else
      _error ->
        {:error, :not_found}
    end
  end

  def patient_delete(conn, %{"token" => token}) do
    with {:ok, %{login_token: login_token}} <- FindYourTeam.create_patient_login_token(token) do
      teams = TeamQueries.all_with_patient_email(login_token.email)
      render(conn, "teams.json", teams: teams, login_token: login_token)
    else
      _error ->
        {:error, :not_found}
    end
  end
end
