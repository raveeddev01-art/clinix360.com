defmodule StitchIntegrations.DrChrono do
  alias Stitch.{Accounts.User, Bot, Integration}
  alias Stitch.Repo
  import Ecto.Query
  alias StitchIntegrations.DrChrono.Token
  require Logger

  def handle_webhook("APPOINTMENT_DELETE", params) do
    IO.inspect(params)
    # payload = params["object"]
    # patient = payload["patient"]
    # scheduled_time = payload["scheduled_time"]
    # reason = payload["reason"]
    # duration = payload["duration"]
    # notes = payload["notes"]

    message = "Appointment deleted"

    new_message(message)
  end

  def handle_webhook("APPOINTMENT_MODIFY", params) do
    payload = params["object"]
    patient = payload["patient"]
    scheduled_time = payload["scheduled_time"]
    reason = payload["reason"]
    duration = payload["duration"]
    notes = payload["notes"]

    message =
      "Event: Appointment modified\nPatient: #{patient}\nScheduled: #{scheduled_time} minutes\nReason: #{
        reason
      }\nDuration: #{duration}\nNotes: #{notes}"

    new_message(message)
  end

  def handle_webhook("CLINICAL_NOTE_LOCK", params) do
    IO.inspect(params)
  end

  def handle_webhook("CLINICAL_NOTE_UNLOCK", params) do
    IO.inspect(params)
  end

  def handle_webhook("PATIENT_ALLERGY_CREATE", params) do
    IO.inspect(params)
  end

  def handle_webhook("PATIENT_ALLERGY_MODIFY", params) do
    IO.inspect(params)
  end

  def handle_webhook("PATIENT_CREATE", params) do
    IO.inspect(params)
  end

  def handle_webhook("PATIENT_MEDICATION_CREATE", params) do
    IO.inspect(params)
  end

  def handle_webhook("PATIENT_MEDICATION_MODIFY", params) do
    IO.inspect(params)
  end

  def handle_webhook("PATIENT_MODIFY", params) do
    IO.inspect(params)
  end

  def handle_webhook("PATIENT_PROBLEM_CREATE", params) do
    IO.inspect(params)
  end

  def handle_webhook("PATIENT_PROBLEM_MODIFY", params) do
    IO.inspect(params)
  end

  def handle_webhook(_event_type, _params) do
    Logger.info("[dr-chrono] [webhook] Unidentified event_type, can't handle this webhook.")
  end

  def new_message(message) do
    IO.puts("Creating new bot message")
    IO.inspect(message)
  end

  def init_integration(team_id, code) do
    Logger.info("[dr-chrono] [team-#{team_id}] Initialize integration.")

    {:ok, response_values} = Token.get_access_token(code)
    Logger.info("[dr-chrono] [team-#{team_id}] Got access token from API.")

    {:ok, integration} = insert_or_update_integration(team_id, response_values)

    Logger.info("[dr-chrono] [team-#{team_id}] Created Integration settings in DB.")

    :ok
  end

  defp insert_or_update_integration(team_id, settings) do
    result =
      case Repo.get_by(Integration, team_id: team_id, name: "drchrono") do
        nil -> %Integration{}
        integration -> integration
      end
      |> Integration.changeset(%{
        team_id: team_id,
        name: "drchrono",
        settings: settings,
        enabled: true
      })
      |> Repo.insert_or_update()

    case result do
      {:ok, integration} ->
        {:ok, integration}

      {:error, changeset} ->
        {:error, "Couldn't update integration settings"}
    end
  end
end
