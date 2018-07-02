defmodule StitchEngage.Web.PatientController do
  use Stitch.Web, :controller

  def show(conn, _) do
    patient = conn.assigns.patient
    json(conn, %{name: patient.first_name <> " " <> patient.last_name})
  end
end
