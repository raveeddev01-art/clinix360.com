defmodule StitchConnect.Web.Api.V1.IntegrationConfigView do
  use StitchConnect.Web, :view
  alias StitchConnect.Web.Api.V1.UserView

  def render("index.json", %{integration_configs: configs}) do
    Enum.map(configs, fn config ->
      %{
        id: config.id,
        integration_id: config.integration_id,
        group_id: config.group_id,
        integration_name: config.integration.name,
        group_name: config.group.name,
        inserted_at: config.inserted_at,
        settings: config.settings
      }
    end)
  end

  def render("show.json", %{integration_config: integration_config} = attrs) do
    %{
      id: integration_config.id,
      integration_id: integration_config.integration_id,
      group_id: integration_config.group_id,
      settings: integration_config.settings
    }
  end
end
