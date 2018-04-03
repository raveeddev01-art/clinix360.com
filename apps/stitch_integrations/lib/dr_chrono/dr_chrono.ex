defmodule StitchIntegrations.DrChrono do
  alias Stitch.{Accounts.User, Integration, Message}
  alias StitchIntegrations.DrChrono.{Bot, Token}
  alias Stitch.Repo
  import Ecto.Query
  require Logger

  def handle_webhook("APPOINTMENT_CREATE", params) do
    payload = params["object"]

    team = Integration.get_team_by_webhook_token(params["webhook_token"])
    {:ok, patient} = get_patient_info(team.id, payload["patient"])
    {:ok, doctor} = get_doctor_info(team.id, payload["doctor"])

    scheduled_time = payload["scheduled_time"]
    reason = payload["reason"]
    duration = payload["duration"]
    notes = payload["notes"]

    message =
      "Event: Appointment created\nDoctor: #{doctor["first_name"]} #{doctor["last_name"]}\nPatient: #{
        patient["first_name"]
      } #{patient["last_name"]}\nScheduled: #{scheduled_time} minutes\nReason: #{reason}\nDuration: #{
        duration
      }\nNotes: #{notes}"

    IO.inspect(message)
    # Bot.post_message(team.id, 4, message)
  end

  def handle_webhook("APPOINTMENT_MODIFY", params) do
    payload = params["object"]

    team = Integration.get_team_by_webhook_token(params["webhook_token"])
    {:ok, patient} = get_patient_info(team.id, payload["patient"])
    {:ok, doctor} = get_doctor_info(team.id, payload["doctor"])

    scheduled_time = payload["scheduled_time"]
    reason = payload["reason"]
    duration = payload["duration"]
    notes = payload["notes"]

    message =
      "Event: Appointment modified\nDoctor: #{doctor["first_name"]} #{doctor["last_name"]}\nPatient: #{
        patient["first_name"]
      } #{patient["last_name"]}\nScheduled: #{scheduled_time} minutes\nReason: #{reason}\nDuration: #{
        duration
      }\nNotes: #{notes}"

    IO.inspect(message)
    # Bot.post_message(team.id, 4, message)
  end

  def handle_webhook("APPOINTMENT_DELETE", params) do
    payload = params["object"]

    team = Integration.get_team_by_webhook_token(params["webhook_token"])
    # {:ok, patient} = get_patient_info(team.id, payload["patient"])
    # {:ok, doctor} = get_doctor_info(team.id, payload["doctor"])

    scheduled_time = payload["scheduled_time"]
    reason = payload["reason"]
    duration = payload["duration"]
    notes = payload["notes"]

    message =
      "Event: Appointment deleted\nScheduled: #{scheduled_time} minutes\nReason: #{reason}\nDuration: #{
        duration
      }\nNotes: #{notes}"

    IO.inspect(message)
    # Bot.post_message(team.id, 4, message)
  end

  def handle_webhook("PATIENT_CREATE", params) do
    payload = params["object"]

    team = Integration.get_team_by_webhook_token(params["webhook_token"])
    {:ok, doctor} = get_doctor_info(team.id, payload["doctor"])
    {:ok, patient} = get_patient_info(team.id, payload["id"])

    patient_name = "#{patient["first_name"]} #{patient["last_name"]}"
    doctor_name = "#{doctor["first_name"]} #{doctor["last_name"]}"
    home_phone = payload["home_phone"]
    cell_phone = payload["cell_phone"]

    message = """
    Event: Patient created
    Patient: #{patient_name}
    Doctor: #{doctor_name}
    Home phone: #{home_phone}
    Cell phone: #{cell_phone}
    """

    IO.inspect(message)
    # Bot.post_message(team.id, 4, message)
  end

  def handle_webhook("PATIENT_MODIFY", params) do
    payload = params["object"]

    team = Integration.get_team_by_webhook_token(params["webhook_token"])
    {:ok, doctor} = get_doctor_info(team.id, payload["doctor"])
    {:ok, patient} = get_patient_info(team.id, payload["id"])

    patient_name = "#{patient["first_name"]} #{patient["last_name"]}"
    doctor_name = "#{doctor["first_name"]} #{doctor["last_name"]}"
    home_phone = payload["home_phone"]
    cell_phone = payload["cell_phone"]

    message = """
    Event: Patient modified
    Patient: #{patient_name}
    Doctor: #{doctor_name}
    Home phone: #{home_phone}
    Cell phone: #{cell_phone}
    """

    IO.inspect(message)
    # Bot.post_message(team.id, 4, message)
  end

  def handle_webhook("PATIENT_PROBLEM_CREATE", params) do
    payload = params["object"]
    team = Integration.get_team_by_webhook_token(params["webhook_token"])
    {:ok, doctor} = get_doctor_info(team.id, payload["doctor"])
    {:ok, patient} = get_patient_info(team.id, payload["patient"])

    patient_name = "#{patient["first_name"]} #{patient["last_name"]}"
    doctor_name = "#{doctor["first_name"]} #{doctor["last_name"]}"

    message = """
    Event: Patient problem created
    Patient: #{patient_name}
    Doctor: #{doctor_name}
    Name: #{payload["name"]}
    Notes: #{payload["notes"]}
    """

    IO.inspect(message)
    # Bot.post_message(team.id, 4, message)
  end

  def handle_webhook("PATIENT_PROBLEM_MODIFY", params) do
    payload = params["object"]
    team = Integration.get_team_by_webhook_token(params["webhook_token"])
    {:ok, doctor} = get_doctor_info(team.id, payload["doctor"])
    {:ok, patient} = get_patient_info(team.id, payload["patient"])

    patient_name = "#{patient["first_name"]} #{patient["last_name"]}"
    doctor_name = "#{doctor["first_name"]} #{doctor["last_name"]}"

    message = """
    Event: Patient problem created
    Patient: #{patient_name}
    Doctor: #{doctor_name}
    Name: #{payload["name"]}
    Notes: #{payload["notes"]}
    """

    IO.inspect(message)
    # Bot.post_message(team.id, 4, message)
  end

  def handle_webhook("PATIENT_ALLERGY_CREATE", params) do
    team = Integration.get_team_by_webhook_token(params["webhook_token"])

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

    IO.inspect(params)
    IO.inspect(message)
    Bot.post_message(team.id, 4, message)
  end

  def handle_webhook("PATIENT_ALLERGY_MODIFY", params) do
    team = Integration.get_team_by_webhook_token(params["webhook_token"])

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

    IO.inspect(params)
    IO.inspect(message)
    Bot.post_message(team.id, 4, message)
  end

  def handle_webhook("PATIENT_MEDICATION_CREATE", params) do
    team = Integration.get_team_by_webhook_token(params["webhook_token"])

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

    IO.inspect(params)
    IO.inspect(message)
    Bot.post_message(team.id, 4, message)
  end

  def handle_webhook("PATIENT_MEDICATION_MODIFY", params) do
    team = Integration.get_team_by_webhook_token(params["webhook_token"])

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

    IO.inspect(params)
    IO.inspect(message)
    Bot.post_message(team.id, 4, message)
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
