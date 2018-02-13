defmodule StitchConnect.Web.Api.V1.FindYourTeamController do
  use StitchConnect.Web, :controller
  alias Stitch.{FindYourTeam, TeamQueries}
  action_fallback StitchConnect.Web.Api.FallbackController

  def create(conn, %{"email" => email}) do
    case FindYourTeam.create_team_list_token(email) do
      {:ok, token} -> FindYourTeam.Email.email(token, StitchConnect.Web.Endpoint.url)
      _ -> nil
    end
    json(conn, %{message: "Email has been sent to #{email}. Please check your inbox."})
  end

  def delete(conn, %{"token" => token}) do
    with {:ok, %{login_token: login_token}} <- FindYourTeam.create_login_token(token) do
      teams = TeamQueries.all_with_user_email(login_token.email)
      render conn, "teams.json", teams: teams, login_token: login_token
    else _error ->
      {:error, :not_found}
    end
  end
end
