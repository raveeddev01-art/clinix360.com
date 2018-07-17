defmodule StitchEngage.Web.PatientController do
  use Stitch.Web, :controller
  alias Stitch.Repo
  alias Stitch.Web.PageService

  def index(conn, _) do
    patient = Repo.preload(conn.assigns.patient, :team)

    conn
    |> assign(:patient, patient)
    |> put_layout("patient.html")
    |> render(Stitch.Web.PatientView, "index.html", app_params: PageService.app_params(conn))
  end
end
