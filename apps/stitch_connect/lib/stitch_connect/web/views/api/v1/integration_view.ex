defmodule StitchConnect.Web.Api.V1.IntegrationView do
  use StitchConnect.Web, :view
  alias StitchConnect.Web.Api.V1.UserView

  def render("index.json", %{integrations: integrations} = attrs) do
    Enum.map(integrations, &integration_json/1)
  end

  def integration_json(integration) do
    %{
      name: integration.name,
      enabled: integration.enabled
    }
  end
end
