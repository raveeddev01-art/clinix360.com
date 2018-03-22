defmodule StitchConnect.Web.OAuthIntegrationController do
  use StitchConnect.Web, :controller
  alias StitchEHR.DrChrono

  def provider_response(conn, %{"provider" => "drchrono", "code" => code}) do
    user = get_session(conn, :current_user_token) |> Stitch.UserQueries.get_by_token()
    team = Stitch.TeamQueries.get_by_id(user.team_id)

    # TODO. After getting a response from DrChrono, init bot user for
    # this team, and generate access_token and refresh_token.
    # {:ok, bot_user} = DrChrono.init_bot_for_team(user.team_id)
    # {:ok, token} = DrChrono.get_access_token(user.team_id, code)

    subdomain_struct = StitchConnect.Web.PageService.subdomain_url_struct(team.slug)

    url =
      StitchConnect.Web.SubdomainRouter.Helpers.admin_integrations_url(
        subdomain_struct,
        :index
      )

    redirect(conn, external: url)
  end

  def provider_response(conn, _params) do
    redirect(conn, to: "/")
  end
end
