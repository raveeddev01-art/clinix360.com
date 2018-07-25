defmodule StitchEngage.Web.Api.V1.PatientDeviceController do
  use Stitch.Web, :controller
  alias Stitch.Mobile

  use Stitch.Web.Api.V1.PatientDeviceDocs

  action_fallback(Stitch.Web.Api.V1.FallbackController)

  def create(conn, params) do
    patient = conn.assigns.patient

    with {_amount, _devices} <- Mobile.remove_patient_device(params["type"], params["token"]),
         {:ok, %Mobile.PatientDevice{}} <- Mobile.register_device(patient, params) do
      conn
      |> put_status(:created)
      |> json(%{message: "Mobile device registered"})
    end
  end

  def delete(conn, %{"type" => type, "token" => token}) do
    {amount_deleted, _devices_deleted} = Mobile.remove_patient_device(type, token)

    case amount_deleted > 0 do
      true -> json(conn, %{message: "Mobile device unregistered"})
      false -> json(conn, %{message: "Could not unregister this mobile device"})
    end
  end
end
