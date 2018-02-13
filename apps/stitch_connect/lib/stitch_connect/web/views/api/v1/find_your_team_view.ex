defmodule StitchConnect.Web.Api.V1.FindYourTeamView do
  use StitchConnect.Web, :view

  def render("teams.json", %{teams: teams, login_token: login_token}) do
    teams = for team <- teams, do: render_team(team, login_token)
    %{teams: teams}
  end

  defp render_team(team, login_token) do
    %{
      name: team.name,
      slug: team.slug,
      login_token: login_token.token,
    }
  end
end
