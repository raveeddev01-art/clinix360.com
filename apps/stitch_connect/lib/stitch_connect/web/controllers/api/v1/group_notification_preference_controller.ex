defmodule StitchConnect.Web.Api.V1.GroupNotificationPreferenceController do
  use StitchConnect.Web, :controller
  alias Stitch.{Group, GroupNotificationPreference}

  plug StitchConnect.Plug.ApiAuthenticate when action in [:show, :update]

  def show(conn, %{"group_id" => group_id}) do
    case GroupNotificationPreference.get_for_user(group_id, conn.assigns.current_user.id) do
      {:ok, preference} ->
        render conn, "show.json", group_notification_preference: preference
      {:error, reason} ->
        conn
        |> put_status(:not_found)
        |> json(%{message: reason})
    end
  end

  def update(conn, %{"group_id" => group_id, "setting" => setting}) do
    case GroupNotificationPreference.update_for_user(group_id, conn.assigns.current_user.id, setting) do
      {:ok, preference} ->
        render conn, "show.json", group_notification_preference: preference
      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: reason})
    end
  end
end
