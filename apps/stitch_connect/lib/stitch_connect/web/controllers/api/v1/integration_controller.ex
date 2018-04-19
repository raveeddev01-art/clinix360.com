defmodule StitchConnect.Web.Api.V1.IntegrationController do
  use StitchConnect.Web, :controller

  alias Stitch.{
    Integration,
    IntegrationQueries,
    IntegrationAuthorization,
    Group,
    GroupQueries,
    App,
    AppQueries
  }

  action_fallback(StitchConnect.Web.Api.FallbackController)

  def index(conn, _params) do
    user = conn.assigns.current_user
    integrations = Integration.get_by_team_id(user.team_id)
    render(conn, "index.json", integrations: integrations)
  end

  def create(conn, %{"app_id" => app_id, "group_id" => group_id}) do
    user = conn.assigns.current_user

    with {:group_exists?, %Group{} = group} <- {:group_exists?, GroupQueries.get_by_id(group_id)},
         {:app_exists?, %App{} = _app} <- {:app_exists?, AppQueries.get_by_id(app_id)},
         {:authorized?, true} <- {:authorized?, IntegrationAuthorization.can_create?(user, group)},
         {:ok, %Integration{} = integration} <- Integration.create(app_id, group_id, user.team_id) do
      render(conn, "show.json", integration: integration)
    else
      {:group_exists?, nil} ->
        {:error, :not_found}

      {:app_exists?, nil} ->
        {:error, :not_found}

      {:authorized?, false} ->
        {:error, :not_authorized, "You can't create integrations"}

      {:error, changeset} ->
        IO.inspect(changeset)
        {:error, :unprocessable_entity, "Couldn't create this integration"}

      _ ->
        {:error, :unprocessable_entity, "Couldn't create this integration"}
    end
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
