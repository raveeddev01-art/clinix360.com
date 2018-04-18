defmodule StitchConnect.Web.Api.V1.IntegrationConfigController do
  use StitchConnect.Web, :controller
  alias Stitch.{IntegrationConfig, IntegrationAuthorization}

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

  def update(conn, %{"id" => id} = params) do
    with {:config, %IntegrationConfig{} = config} <- {:config, IntegrationConfig.get_by_id(id)},
         {:authorized?, true} <-
           {:authorized?, IntegrationAuthorization.can_edit?(config, conn.assigns.current_user)},
         {:updated?, {:ok, _config}} <- {:updated?, IntegrationConfig.update(config, params)} do
      conn
      |> json(%{message: "Configuration updated"})
    else
      {:config, _} ->
        {:error, :not_found, "The integration config you are looking for does not exist."}

      {:authorized?, false} ->
        {:error, :not_authorized, "You can't update this configuration."}

      {:updated?, {:error, _changeset}} ->
        {:error, :unprocessable_entity, "Couldn't update this configuration"}

      _ ->
        {:error, :not_found}
    end
  end

  def delete(conn, %{"id" => id}) do
    with {:config, %IntegrationConfig{} = config} <- {:config, IntegrationConfig.get_by_id(id)},
         {:authorized?, true} <-
           {:authorized?, IntegrationAuthorization.can_delete?(config, conn.assigns.current_user)},
         {:deleted?, {:ok, _config}} <- {:deleted?, IntegrationConfig.delete(config)} do
      conn
      |> json(%{message: "Configuration removed"})
    else
      {:config, _} ->
        {:error, :not_found, "The integration config you are looking for does not exist."}

      {:authorized?, false} ->
        {:error, :not_authorized, "You can't delete this configuration."}

      {:deleted?, {:error, _changeset}} ->
        {:error, :unprocessable_entity, "Couldn't delete this configuration"}

      _ ->
        {:error, :not_found}
    end
  end
end
