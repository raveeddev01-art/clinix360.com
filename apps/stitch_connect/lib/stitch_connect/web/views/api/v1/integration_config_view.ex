defmodule StitchConnect.Web.Api.V1.IntegrationConfigView do
  use StitchConnect.Web, :view
  alias StitchConnect.Web.Api.V1.UserView

  def render("show.json", %{integration_config: integration_config} = attrs) do
    %{
      id: integration_config.id,
      integration_id: integration_config.integration_id,
      group_id: integration_config.group_id,
      settings: integration_config.settings
    }
  end
end
