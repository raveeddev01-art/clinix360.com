defmodule StitchConnect.Web.OAuthIntegrationController do
  use Stitch.Web, :controller
  alias Stitch.Drchrono
  alias Stitch.{Accounts.User, Team, Integration, IntegrationQueries}

  def provider_response(conn, %{
        "provider" => "drchrono",
        "webhook_token" => webhook_token,
        "code" => code
      }) do
    with user_token when not is_nil(user_token) <- get_user_session_token(conn),
         %User{} = user <- Stitch.UserQueries.get_by_token(user_token),
         %Team{} = team <- Stitch.TeamQueries.get_by_id(user.team_id),
         {:exists?, %Integration{} = integration} <-
           {:exists?, IntegrationQueries.find_by_webhook_token(webhook_token)},
         {:initialized?, :ok} <- {:initialized?, Drchrono.init_integration(integration, code)} do
      subdomain_struct = Stitch.Web.PageService.subdomain_url_struct(team.slug)

      url =
        Stitch.Web.SubdomainRouter.Helpers.admin_integration_edit_url(
          subdomain_struct,
          :index,
          integration.id
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
