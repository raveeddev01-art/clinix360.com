defmodule StitchConnect.Web.OAuthIntegrationController do
  use StitchConnect.Web, :controller
  alias StitchIntegrations.DrChrono
  alias StitchIntegrations.DrChrono.Bot
  alias Stitch.{Accounts.User, Team}

  def provider_response(conn, %{"provider" => "drchrono", "code" => code}) do
    with user_token when not is_nil(user_token) <- get_session(conn, :current_user_token),
         %User{} = user <- Stitch.UserQueries.get_by_token(user_token),
         %Team{} = team <- Stitch.TeamQueries.get_by_id(user.team_id),
         :ok = DrChrono.init_integration(user.team_id, code),
         {:ok, bot_user} = Bot.init_or_enable_bot(user.team_id) do
      subdomain_struct = StitchConnect.Web.PageService.subdomain_url_struct(team.slug)

      url =
        StitchConnect.Web.SubdomainRouter.Helpers.admin_integrations_url(
          subdomain_struct,
          :index
        )

      redirect(conn, external: url)
    else
      _ ->
        redirect(conn, to: "/")
    end
  end

  def provider_response(conn, _params) do
    redirect(conn, to: "/")
  end
end
