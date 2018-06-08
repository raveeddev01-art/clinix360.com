defmodule Stitch.Web.Api.V1.TeamPatientController do
  use Stitch.Web, :controller

  # We should add analytics before activating
  # alias Stitch.Analytics.Patient, as: PatientAnalytics

  alias Stitch.{TeamPatient, PatientAuthorization, PatientQueries}

  action_fallback(Stitch.Web.Api.V1.FallbackController)

  def index(conn, _params) do
    team_patients = PatientQueries.team_patients_for_team_id(conn.private[:team_id])
    render(conn, "index.json", team_patients: team_patients)
  end

  def show(conn, %{"id" => id}) do
    case PatientQueries.get_team_patient(id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "Patient not found"})

      team_patient ->
        render(conn, "show.json", team_patient: team_patient)
    end
  end

  def create(conn, params) do
    current_user = conn.assigns.current_user
    team = conn.assigns.team

    with {:authorized?, true} <-
           {:authorized?, PatientAuthorization.can_create_as_provider?(team.id, current_user)},
         {:ok, %{team_patient: team_patient, patient: patient}} <-
           TeamPatient.create_as_provider(team, params) do
      render(conn, "show.json", team_patient: team_patient, patient: patient)
    else
      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot create a patient on this team."}

      {:error, _model_errored, changeset, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})
    end
  end

  def update(conn, params = %{"id" => id}) do
    current_user = conn.assigns.current_user

    with {:authorized?, true} <-
           {:authorized?, PatientAuthorization.can_update_as_provider?(id, current_user)},
         {:ok, team_patient} when not is_nil(team_patient) <-
           {:ok, PatientQueries.get_team_patient(id)},
         {:ok, %{team_patient: updated_team_patient, patient: patient}} <-
           TeamPatient.update_as_provider(team_patient, params) do
      render(conn, "show.json", team_patient: updated_team_patient, patient: patient)
    else
      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot update this patient."}

      {:error, _model_errored, changeset, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})
    end
  end
end
