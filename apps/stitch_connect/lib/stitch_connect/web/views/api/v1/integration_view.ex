defmodule StitchConnect.Web.Api.V1.IntegrationView do
  use StitchConnect.Web, :view
  alias StitchConnect.Web.Api.V1.UserView

  def render("index.json", %{integrations: integrations} = attrs) do
    Enum.map(integrations, &integration_json/1)
  end

  def render("show.json", %{integration: integration} = attrs) do
    integration_json(integration)
  end

  def integration_json(integration) do
    %{
      id: integration.id,
      inserted_at: integration.inserted_at,
      settings: integration.settings || %{},
      credentials: integration.credentials || %{},
      enabled: integration.enabled,
      webhook_token: "https://teamstitch.com/webhooks/#{integration.webhook_token}",
      app_id: integration.app_id,
      group_id: integration.group_id
    }
  end
end
