defmodule StitchConnect.Web.Api.V1.DeviceController do
  use StitchConnect.Web, :controller
  alias Stitch.Mobile

  def create(conn, params) do
    user = conn.assigns.current_user

    with {:ok, %Mobile.Device{}} <- Mobile.register_device(user, params) do
      conn
      |> put_status(:created)
      |> json(%{message: "Mobile device registered"})
    end
  end
end
