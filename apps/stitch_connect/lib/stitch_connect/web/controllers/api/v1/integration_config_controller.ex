defmodule StitchConnect.Web.Api.V1.IntegrationConfigController do
  use StitchConnect.Web, :controller
  alias Stitch.{Integration, IntegrationConfig}

  action_fallback(StitchConnect.Web.Api.FallbackController)

  def index(conn, _params) do
    configs = IntegrationConfig.all_for_team(conn.assigns.current_user.team_id)
    render(conn, "index.json", integration_configs: configs)
  end

  def create(conn, params) do
    with {:ok, integration_config} <- IntegrationConfig.insert_integration_config(params) do
      render(conn, "show.json", integration_config: integration_config)
    else
      _ ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "This configuration is already set for this room"})
    end
  end
end
