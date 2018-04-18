defmodule StitchConnect.Web.Api.V1.IntegrationView do
  use StitchConnect.Web, :view

  def render("index.json", %{integrations: integrations}) do
    Enum.map(integrations, &integration_json/1)
  end

  def render("show.json", %{integration: integration}) do
    integration_json(integration)
  end

  def integration_json(integration) do
    %{
      id: integration.id,
      name: integration.name,
      enabled: integration.enabled,
      webhook_token: integration.webhook_token
    }
  end
end
