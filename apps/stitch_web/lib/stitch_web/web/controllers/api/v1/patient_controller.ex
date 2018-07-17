defmodule Stitch.Web.Api.V1.PatientController do
  use Stitch.Web, :controller
  use Stitch.Web.Api.V1.PatientDocs

  # We should add analytics before activating
  # alias Stitch.Analytics.Patient, as: PatientAnalytics

  alias Stitch.{
    PatientAuthorization,
    PatientQueries,
    Patient,
    Web.TeamChannel
  }

  action_fallback(Stitch.Web.Api.V1.FallbackController)

  def index(conn, _params) do
    patients = PatientQueries.patients_for_team_id(conn.private[:team_id])
    render(conn, "index.json", patients: patients)
  end

  def show(conn, %{"id" => id}) do
    case PatientQueries.get_patient(id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "Patient not found"})

      patient ->
        render(conn, "show.json", patient: patient)
    end
  end

  def create(conn, params) do
    current_user = conn.assigns.current_user
    team = conn.assigns.team

    with {:authorized?, true} <-
           {:authorized?, PatientAuthorization.can_create_as_provider?(team.id, current_user)},
         {:ok, patient} <- Patient.create_as_provider(team.id, params) do
      TeamChannel.broadcast_patient_added(conn.assigns.team.id, patient)

      render(conn, "show.json", patient: patient)
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
         {:ok, patient} when not is_nil(patient) <- {:ok, PatientQueries.get_patient(id)},
         {:ok, updated_patient} <- Patient.update_as_provider(patient, params) do
      TeamChannel.broadcast_patient_updated(
        conn.assigns.team.id,
        updated_patient
      )

      render(conn, "show.json", patient: patient)
    else
      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot update this patient."}

      {:error, _model_errored, changeset, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})
    end
  end

  def update_as_patient(conn, params) do
    patient = conn.assigns.patient

    with {:onboarded?, true} <- {:onboarded?, patient.onboarded},
         {:ok, updated_patient} <- Patient.update_as_patient(patient, params) do
      TeamChannel.broadcast_patient_updated(
        conn.assigns.team.id,
        updated_patient
      )

      render(conn, "show.json", patient: updated_patient)
    else
      {:onboarded?, _} ->
        {:error, :not_authorized, "You must be onboarded to update your information."}

      {:error, _model_errored, changeset, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})
    end
  end

  def activate(conn, params) do
    change_active_value(conn, params, true)
  end

  def deactivate(conn, params) do
    change_active_value(conn, params, false)
  end

  defp change_active_value(conn, %{"id" => id}, active_status) do
    current_user = conn.assigns.current_user

    with {:authorized?, true} <-
           {:authorized?, PatientAuthorization.can_update_as_provider?(id, current_user)},
         {:ok, patient} when not is_nil(patient) <- {:ok, PatientQueries.get_patient(id)},
         {:ok, patient} <- Patient.change_disabled_status_as_provider(patient, active_status) do
      TeamChannel.broadcast_patient_updated(
        conn.assigns.team.id,
        patient
      )

      render(conn, "show.json", patient: patient)
    else
      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot update this patient."}

      {:error, _model_errored, changeset, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})
    end
  end

  def exists(conn, %{"email" => email}) do
    team_id = conn.private[:team_id]

    case PatientQueries.team_member_with_email(team_id, email) do
      %Patient{} -> json(conn, %{exists: true})
      _ -> json(conn, %{exists: false})
    end
  end
end
