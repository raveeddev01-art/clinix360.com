defmodule StitchConnect.Web.Api.V1.NotificationPreferenceController do
  use StitchConnect.Web, :controller
  alias Stitch.Accounts.User
  alias Stitch.Message.Notification

  plug StitchConnect.Plug.ApiAuthenticate when action in [:show_preference, :update_preference]

  def show_preference(conn, %{} = params) do
    render conn, "show.json",
      user: conn.assigns.current_user,
      group_preferences: Notification.for_user(conn.assigns.current_user.id)
  end

  def update_preference(conn, %{} = params) do
    case User.update_preference(conn.assigns.current_user, params) do
      {:ok, user} ->
        render conn, "show.json", user: user
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})
    end
  end
end
