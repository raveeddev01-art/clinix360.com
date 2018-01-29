defmodule StitchConnect.Web.Api.V1.DeviceController do
  use StitchConnect.Web, :controller
  alias Stitch.Mobile

  action_fallback(StitchConnect.Web.Api.V1.FallbackController)

  def create(conn, params) do
    user = conn.assigns.current_user

    with {_amount, _devices} <- Mobile.remove_device(params["type"], params["token"]),
         {:ok, %Mobile.Device{}} <- Mobile.register_device(user, params) do
      conn
      |> put_status(:created)
      |> json(%{message: "Mobile device registered"})
    end
  end

  def delete(conn, %{"type" => type, "token" => token}) do
    {amount_deleted, _devices_deleted} = Mobile.remove_device(type, token)

    case amount_deleted > 0 do
      true -> json(conn, %{message: "Mobile device unregistered"})
      false -> json(conn, %{message: "Could not unregister this mobile device"})
    end
  end
end