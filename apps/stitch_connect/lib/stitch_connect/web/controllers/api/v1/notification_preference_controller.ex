defmodule StitchConnect.Web.Api.V1.NotificationPreferenceController do
  use StitchConnect.Web, :controller
  alias Stitch.Accounts.User

  plug StitchConnect.Plug.ApiAuthenticate when action in [:show_preference]

  def show_preference(conn, %{} = params) do
    render conn, "show.json", user: conn.assigns.current_user
  end
end
