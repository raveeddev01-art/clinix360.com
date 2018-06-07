defmodule Stitch.Web.Api.V1.TeamPatientController do
  use Stitch.Web, :controller

  # We should add analytics before activating
  # alias Stitch.Analytics.Patient, as: PatientAnalytics

  alias Stitch.PatientQueries

  action_fallback(Stitch.Web.Api.V1.FallbackController)

  def index(conn, _params) do
    team_patients = PatientQueries.team_patients_for_team_id(conn.private[:team_id])
    render(conn, "index.json", team_patients: team_patients)
  end
end
