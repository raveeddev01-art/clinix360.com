defmodule StitchConnect.Web.Api.V1.NotificationPreferenceController do
  use StitchConnect.Web, :controller
  alias Stitch.Accounts.User
  alias Stitch.GroupUser
  alias Stitch.Message.Notification
  alias StitchConnect.Web.EventsChannel

  def show_global(conn, _params) do
    render conn, "show_global.json",
      user: conn.assigns.current_user,
      group_preferences: Notification.for_user(conn.assigns.current_user.id)
  end

  def update_global(conn, %{} = params) do
    case User.update_preference(conn.assigns.current_user, params) do
      {:ok, %{user: user}} ->
        notification_preference = Notification.for_user(conn.assigns.current_user.id)
        EventsChannel.broadcast_notification_preference_update(user, notification_preference)
        render(conn, "show_global.json", user: user, group_preferences: notification_preference)
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})
    end
  end

  def show(conn, %{"group_id" => group_id}) do
    case GroupUser.get_preference(group_id, conn.assigns.current_user.id) do
      {:ok, group_user} ->
        render conn, "show.json", group_user: group_user
      {:error, _reason} ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "Not found"})
    end
  end

  def update(conn, %{"group_id" => group_id} = params) do
    case GroupUser.update_preference(group_id, conn.assigns.current_user.id, params) do
      {:ok, group_user} ->
        render conn, "show.json", group_user: group_user
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})
    end
  end
end
