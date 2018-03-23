defmodule StitchConnect.Web.Api.V1.IntegrationController do
  use StitchConnect.Web, :controller
  alias Stitch.Integration

  action_fallback(StitchConnect.Web.Api.FallbackController)

  def index(conn, params) do
    user = conn.assigns.current_user
    integrations = Integration.get_by_team_id(user.team_id)
    render(conn, "index.json", integrations: integrations)
  end
end
