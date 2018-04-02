defmodule StitchIntegrations.DrChrono do
  alias Stitch.{Accounts.User, Integration, Message}
  alias StitchIntegrations.DrChrono.{Bot, Token}
  alias Stitch.Repo
  import Ecto.Query
  require Logger

  def handle_webhook("APPOINTMENT_CREATE", params) do
    payload = params["object"]
    patient = payload["patient"]
    scheduled_time = payload["scheduled_time"]
    reason = payload["reason"]
    duration = payload["duration"]
    notes = payload["notes"]

    message =
      "Event: Appointment created\nPatient: #{patient}\nScheduled: #{scheduled_time} minutes\nReason: #{
        reason
      }\nDuration: #{duration}\nNotes: #{notes}"

    # 15 is team Zephyr
    # 4 is group General.
    Bot.post_message(15, 4, message)
  end

  def handle_webhook("APPOINTMENT_DELETE", params) do
    payload = params["object"]
    patient = payload["patient"]
    scheduled_time = payload["scheduled_time"]
    reason = payload["reason"]
    duration = payload["duration"]
    notes = payload["notes"]

    message =
      "Event: Appointment deleted\nPatient: #{patient}\nScheduled: #{scheduled_time} minutes\nReason: #{
        reason
      }\nDuration: #{duration}\nNotes: #{notes}"

    Bot.post_message(15, 4, message)
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

    Bot.post_message(15, 4, message)
  end

  def handle_webhook("PATIENT_CREATE", params) do
    payload = params["object"]
    patient_name = "#{payload["first_name"]} #{payload["middle_name"]} #{payload["last_name"]}"
    patient_id = payload["id"]
    dob = payload["date_of_birth"]
    phone = payload["home_phone"] || payload["cell_phone"]
    address = payload["address"]
    doctor = payload["doctor"]

    message =
      "Event: Patient created\nPatient: #{patient_name}\nPatient ID: #{patient_id}\nDOB: #{dob}\nPhone: #{
        phone
      }\nAddress: #{address}\nDoctor: #{doctor}"

    Bot.post_message(15, 4, message)
  end

  def handle_webhook("PATIENT_MODIFY", params) do
    team = Integration.get_team_by_webhook_token(params["webhook-token"])

    payload = params["object"]
    patient_name = "#{payload["first_name"]} #{payload["middle_name"]} #{payload["last_name"]}"
    patient_id = payload["id"]
    dob = payload["date_of_birth"]
    phone = payload["home_phone"] || payload["cell_phone"]
    address = payload["address"]
    doctor = payload["doctor"]

    message =
      "Event: Patient modified\nPatient: #{patient_name}\nPatient ID: #{patient_id}\nDOB: #{dob}\nPhone: #{
        phone
      }\nAddress: #{address}\nDoctor: #{doctor}"

    Bot.post_message(team.id, 4, message)
  end

  def handle_webhook("PATIENT_PROBLEM_CREATE", params) do
    payload = params["object"]
    description = payload["description"]
    doctor = payload["doctor"]
    icd = "#{payload["icd_code"]} | version #{payload["icd_version"]}"
    patient = payload["patient"]

    message =
      "Event: Patient problem created\nPatient: #{patient}\nPatient ID: #{patient}\nDoctor: #{
        doctor
      }\nICD: #{icd}\nDescription: #{description}"

    Bot.post_message(15, 4, message)
  end

  def handle_webhook("PATIENT_PROBLEM_MODIFY", params) do
    payload = params["object"]
    description = payload["description"]
    doctor = payload["doctor"]
    icd = "#{payload["icd_code"]} | version #{payload["icd_version"]}"
    patient = payload["patient"]

    message =
      "Event: Patient problem modified\nPatient: #{patient}\nPatient ID: #{patient}\nDoctor: #{
        doctor
      }\nICD: #{icd}\nDescription: #{description}"

    Bot.post_message(15, 4, message)
  end

  def handle_webhook("PATIENT_ALLERGY_CREATE", params) do
    payload = params["object"]
    patient = payload["patient"]
    patient_id = payload["patient"]
    doctor = payload["doctor"]
    reaction = payload["reaction"]
    rxnorm = payload["rxnorm"]
    snomed_reaction = payload["snomed_reaction"]
    notes = payload["notes"]

    message =
      "Event: Patient allergy created\nPatient: #{patient}\nPatient ID: #{patient}\nDoctor: #{
        doctor
      }\nReaction: #{reaction}\nRxnorm: #{rxnorm}\nSnomed Reaction:#{snomed_reaction}\nNotes:#{
        notes
      }"

    Bot.post_message(15, 4, message)
  end

  def handle_webhook("PATIENT_ALLERGY_MODIFY", params) do
    payload = params["object"]
    patient = payload["patient"]
    patient_id = payload["patient"]
    doctor = payload["doctor"]
    reaction = payload["reaction"]
    rxnorm = payload["rxnorm"]
    snomed_reaction = payload["snomed_reaction"]
    notes = payload["notes"]

    message =
      "Event: Patient allergy modified\nPatient: #{patient}\nPatient ID: #{patient}\nDoctor: #{
        doctor
      }\nReaction: #{reaction}\nRxnorm: #{rxnorm}\nSnomed Reaction:#{snomed_reaction}\nNotes:#{
        notes
      }"

    Bot.post_message(15, 4, message)
  end

  def handle_webhook("PATIENT_MEDICATION_CREATE", params) do
    payload = params["object"]
    patient = payload["patient"]
    patient_id = payload["patient"]
    doctor = payload["doctor"]
    name = payload["name"]
    notes = payload["notes"]

    message =
      "Event: Patient medication created\nPatient: #{patient}\nPatient ID: #{patient}\nDoctor: #{
        doctor
      }\nName: #{name}\nNotes: #{notes}"

    Bot.post_message(15, 4, message)
  end

  def handle_webhook("PATIENT_MEDICATION_MODIFY", params) do
    payload = params["object"]
    patient = payload["patient"]
    patient_id = payload["patient"]
    doctor = payload["doctor"]
    name = payload["name"]
    notes = payload["notes"]

    message =
      "Event: Patient medication modified\nPatient: #{patient}\nPatient ID: #{patient}\nDoctor: #{
        doctor
      }\nName: #{name}\nNotes: #{notes}"

    Bot.post_message(15, 4, message)
  end

  # We haven't implemented these two webhooks.
  # def handle_webhook("CLINICAL_NOTE_LOCK", params) do
  #   IO.inspect(params)
  # end

  # def handle_webhook("CLINICAL_NOTE_UNLOCK", params) do
  #   IO.inspect(params)
  # end

  def handle_webhook(_event_type, _params) do
    Logger.info("[dr-chrono] [webhook] Unidentified event_type, can't handle this webhook.")
  end

  def get_patient_info(team_id, patient_id) do
    api_url = "https://drchrono.com/api/patients/#{patient_id}"
    api_headers = headers(team_id)
    http_get(api_url, api_headers)
  end

  def get_doctor_info(team_id, doctor_id) do
    api_url = "https://drchrono.com/api/doctors/#{doctor_id}"
    api_headers = headers(team_id)
    http_get(api_url, api_headers)
  end

  def headers(team_id) do
    {:ok, token} = Token.for_team(team_id)
    [Authorization: "Bearer #{token}"]
  end

  def http_get(api_url, headers) do
    case HTTPoison.get(api_url, headers) do
      {:ok, response} ->
        Poison.decode(response.body)

      {:error, error} ->
        {:error, error}
    end
  end

  def init_integration(team_id, code) do
    Logger.info("[dr-chrono] [team-#{team_id}] Initialize integration.")

    {:ok, response_values} = Token.get_access_token(code)
    Logger.info("[dr-chrono] [team-#{team_id}] Got access token from API.")

    {:ok, integration} = insert_or_update_integration(team_id, response_values)

    Logger.info("[dr-chrono] [team-#{team_id}] Created Integration settings in DB.")

    :ok
  end

  def insert_or_update_integration(team_id, settings) do
    result =
      case Repo.get_by(Integration, team_id: team_id, name: "drchrono") do
        nil ->
          webhook_token =
            :crypto.strong_rand_bytes(36) |> Base.url_encode64() |> binary_part(0, 36)

          %Integration{}
          |> Integration.changeset(%{
            team_id: team_id,
            name: "drchrono",
            settings: settings,
            enabled: true,
            webhook_token: webhook_token
          })
          |> Repo.insert_or_update()

        integration ->
          integration
          |> Integration.changeset(%{
            team_id: team_id,
            name: "drchrono",
            settings: settings,
            enabled: true
          })
          |> Repo.insert_or_update()
      end

    case result do
      {:ok, integration} ->
        {:ok, integration}

      {:error, changeset} ->
        {:error, "Couldn't update integration settings"}
    end
  end
end
