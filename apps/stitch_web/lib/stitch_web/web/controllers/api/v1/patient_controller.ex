defmodule Stitch.Web.Api.V1.PatientController do
  use Stitch.Web, :controller

  # TODO: Add analytics
  # alias Stitch.Analytics.Patient, as: PatientAnalytics

  alias Stitch.PatientQueries

  action_fallback(Stitch.Web.Api.V1.FallbackController)

  def index(conn, _params) do
    patients = PatientQueries.for_team(conn.private[:team_id])
    render(conn, "index.json", patients: patients)
  end
end
