defmodule StitchConnect.Web.Api.V1.IntegrationController do
  use StitchConnect.Web, :controller
  alias Stitch.{Integration, IntegrationQueries, IntegrationAuthorization}

  action_fallback(StitchConnect.Web.Api.FallbackController)

  def index(conn, _params) do
    user = conn.assigns.current_user
    integrations = Integration.get_by_team_id(user.team_id)
    render(conn, "index.json", integrations: integrations)
  end

  def enable(conn, %{"id" => id}) do
    user = conn.assigns.current_user

    with %Integration{} = integration <- IntegrationQueries.find_by_id(id),
         {:authorized?, true} <-
           {:authorized?, IntegrationAuthorization.can_disable?(user, integration)},
         {:enabled?, {:ok, integration}} <- {:enabled?, Integration.enable(integration)} do
      render(conn, "show.json", integration: integration)
    else
      nil ->
        {:error, :not_found}

      {:authorized?, false} ->
        {:error, :not_authorized, "You can't enable this integration"}

      {:enabled?, {:error, _changeset}} ->
        {:error, :unprocessable_entity, "Couldn't enable this integration"}

      _ ->
        {:error, :not_found}
    end
  end

  def disable(conn, %{"id" => id}) do
    user = conn.assigns.current_user

    with %Integration{} = integration <- IntegrationQueries.find_by_id(id),
         {:authorized?, true} <-
           {:authorized?, IntegrationAuthorization.can_disable?(user, integration)},
         {:disabled?, {:ok, integration}} <- {:disabled?, Integration.disable(integration)} do
      render(conn, "show.json", integration: integration)
    else
      nil ->
        {:error, :not_found}

      {:authorized?, false} ->
        {:error, :not_authorized, "You can't disable this integration"}

      {:disabled?, {:error, _changeset}} ->
        {:error, :unprocessable_entity, "Couldn't disable this integration"}

      _ ->
        {:error, :not_found}
    end
  end
end
