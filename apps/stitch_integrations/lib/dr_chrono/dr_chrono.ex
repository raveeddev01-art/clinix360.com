defmodule StitchIntegrations.DrChrono do
  alias Stitch.{Accounts.User, Integration, Message}
  alias StitchIntegrations.DrChrono.{Bot, Token}
  alias Stitch.Repo
  import Ecto.Query
  require Logger

  def enabled_groups(team_id, event_name) do
    team = Stitch.Repo.get(Stitch.Team, team_id)

    query =
      from(
        i in Integration,
        where: i.team_id == ^team_id,
        where: i.name == "drchrono",
        where: i.enabled == true,
        preload: [integration_configs: :group]
      )

    integration = Stitch.Repo.one(query)

    Enum.filter(integration.integration_configs, fn config ->
      config.settings[event_name] == true
    end)
    |> Enum.map(& &1.group)
  end

  defp value_or_na(nil), do: "N/A"

  defp value_or_na(value) do
    if value == "" do
      "N/A"
    else
      value
    end
  end

  def handle_webhook(integration, "APPOINTMENT_CREATE", params) do
    payload = params["object"]

    {:ok, patient} = get_patient_info(integration, payload["patient"])
    {:ok, doctor} = get_doctor_info(integration, payload["doctor"])

    scheduled_time = value_or_na(payload["scheduled_time"])
    reason = value_or_na(payload["reason"])
    duration = value_or_na(payload["duration"])
    notes = value_or_na(payload["notes"])

    message =
      "Event: Appointment created\nDoctor: #{doctor["first_name"]} #{doctor["last_name"]}\nPatient: #{
        patient["first_name"]
      } #{patient["last_name"]}\nScheduled: #{scheduled_time} minutes\nReason: #{reason}\nDuration: #{
        duration
      }\nNotes: #{notes}"

    if integration.settings["appointmentCreate"] do
      Bot.post_message(integration.team_id, integration.group_id, message)
    end
  end

  def handle_webhook(integration, "APPOINTMENT_MODIFY", params) do
    payload = params["object"]

    {:ok, patient} = get_patient_info(integration, payload["patient"])
    {:ok, doctor} = get_doctor_info(integration, payload["doctor"])

    scheduled_time = value_or_na(payload["scheduled_time"])
    reason = value_or_na(payload["reason"])
    duration = value_or_na(payload["duration"])
    notes = value_or_na(payload["notes"])

    message =
      "Event: Appointment modified\nDoctor: #{doctor["first_name"]} #{doctor["last_name"]}\nPatient: #{
        patient["first_name"]
      } #{patient["last_name"]}\nScheduled: #{scheduled_time} minutes\nReason: #{reason}\nDuration: #{
        duration
      }\nNotes: #{notes}"

    if integration.settings["appointmentModify"] do
      Bot.post_message(integration.team_id, integration.group_id, message)
    end
  end

  def handle_webhook(integration, "APPOINTMENT_DELETE", params) do
    payload = params["object"]

    scheduled_time = value_or_na(payload["scheduled_time"])
    reason = value_or_na(payload["reason"])
    duration = value_or_na(payload["duration"])
    notes = value_or_na(payload["notes"])

    message =
      "Event: Appointment deleted\nScheduled: #{scheduled_time} minutes\nReason: #{reason}\nDuration: #{
        duration
      }\nNotes: #{notes}"

    if integration.settings["appointmentDelete"] do
      Bot.post_message(integration.team_id, integration.group_id, message)
    end
  end

  def handle_webhook(integration, "PATIENT_CREATE", params) do
    payload = params["object"]

    {:ok, patient} = get_patient_info(integration, payload["id"])
    {:ok, doctor} = get_doctor_info(integration, payload["doctor"])

    patient_name = "#{patient["first_name"]} #{patient["last_name"]}"
    doctor_name = "#{doctor["first_name"]} #{doctor["last_name"]}"
    home_phone = value_or_na(payload["home_phone"])
    cell_phone = value_or_na(payload["cell_phone"])

    message = """
    Event: Patient created
    Patient: #{patient_name}
    Doctor: #{doctor_name}
    Home phone: #{home_phone}
    Cell phone: #{cell_phone}
    """

    if integration.settings["patientCreate"] do
      Bot.post_message(integration.team_id, integration.group_id, message)
    end
  end

  def handle_webhook(integration, "PATIENT_MODIFY", params) do
    payload = params["object"]

    {:ok, patient} = get_patient_info(integration, payload["id"])
    {:ok, doctor} = get_doctor_info(integration, payload["doctor"])

    patient_name = "#{patient["first_name"]} #{patient["last_name"]}"
    doctor_name = "#{doctor["first_name"]} #{doctor["last_name"]}"
    home_phone = value_or_na(payload["home_phone"])
    cell_phone = value_or_na(payload["cell_phone"])

    message = """
    Event: Patient modified
    Patient: #{patient_name}
    Doctor: #{doctor_name}
    Home phone: #{home_phone}
    Cell phone: #{cell_phone}
    """

    if integration.settings["patientModify"] do
      Bot.post_message(integration.team_id, integration.group_id, message)
    end
  end

  def handle_webhook(integration, "PATIENT_PROBLEM_CREATE", params) do
    payload = params["object"]

    {:ok, patient} = get_patient_info(integration, payload["patient"])
    {:ok, doctor} = get_doctor_info(integration, payload["doctor"])

    patient_name = "#{patient["first_name"]} #{patient["last_name"]}"
    doctor_name = "#{doctor["first_name"]} #{doctor["last_name"]}"

    message = """
    Event: Patient problem created
    Patient: #{patient_name}
    Doctor: #{doctor_name}
    Name: #{value_or_na(payload["name"])}
    Notes: #{value_or_na(payload["notes"])}
    """

    if integration.settings["patientProblemCreate"] do
      Bot.post_message(integration.team_id, integration.group_id, message)
    end
  end

  def handle_webhook(integration, "PATIENT_PROBLEM_MODIFY", params) do
    payload = params["object"]

    {:ok, patient} = get_patient_info(integration, payload["patient"])
    {:ok, doctor} = get_doctor_info(integration, payload["doctor"])

    patient_name = "#{patient["first_name"]} #{patient["last_name"]}"
    doctor_name = "#{doctor["first_name"]} #{doctor["last_name"]}"

    message = """
    Event: Patient problem modified
    Patient: #{patient_name}
    Doctor: #{doctor_name}
    Name: #{value_or_na(payload["name"])}
    Notes: #{value_or_na(payload["notes"])}
    """

    if integration.settings["patientProblemModify"] do
      Bot.post_message(integration.team_id, integration.group_id, message)
    end
  end

  def handle_webhook(integration, "PATIENT_ALLERGY_CREATE", params) do
    payload = params["object"]

    {:ok, patient} = get_patient_info(integration, payload["patient"])
    {:ok, doctor} = get_doctor_info(integration, payload["doctor"])

    patient_name = "#{patient["first_name"]} #{patient["last_name"]}"
    doctor_name = "#{doctor["first_name"]} #{doctor["last_name"]}"
    notes = value_or_na(payload["notes"])
    reaction = value_or_na(payload["reaction"])

    message = """
    Event: Patient allergy created
    Patient: #{patient_name}
    Doctor: #{doctor_name}
    Reaction: #{reaction}
    Notes: #{notes}
    """

    if integration.settings["patientAllergyCreate"] do
      Bot.post_message(integration.team_id, integration.group_id, message)
    end
  end

  def handle_webhook(integration, "PATIENT_ALLERGY_MODIFY", params) do
    payload = params["object"]

    {:ok, patient} = get_patient_info(integration, payload["patient"])
    {:ok, doctor} = get_doctor_info(integration, payload["doctor"])

    patient_name = "#{patient["first_name"]} #{patient["last_name"]}"
    doctor_name = "#{doctor["first_name"]} #{doctor["last_name"]}"
    notes = value_or_na(payload["notes"])
    reaction = value_or_na(payload["reaction"])

    message = """
    Event: Patient allergy modified
    Patient: #{patient_name}
    Doctor: #{doctor_name}
    Reaction: #{reaction}
    Notes: #{notes}
    """

    if integration.settings["patientAllergyModify"] do
      Bot.post_message(integration.team_id, integration.group_id, message)
    end
  end

  def handle_webhook(integration, "PATIENT_MEDICATION_CREATE", params) do
    payload = params["object"]

    {:ok, patient} = get_patient_info(integration, payload["patient"])
    {:ok, doctor} = get_doctor_info(integration, payload["doctor"])

    patient_name = "#{patient["first_name"]} #{patient["last_name"]}"
    doctor_name = "#{doctor["first_name"]} #{doctor["last_name"]}"
    medication_name = value_or_na(payload["name"])
    indication = value_or_na(payload["indication"])

    message = """
    Event: Patient medication created
    Patient: #{patient_name}
    Doctor: #{doctor_name}
    Medication: #{medication_name}
    Indication: #{indication}
    """

    if integration.settings["patientMedicationCreate"] do
      Bot.post_message(integration.team_id, integration.group_id, message)
    end
  end

  def handle_webhook(integration, "PATIENT_MEDICATION_MODIFY", params) do
    payload = params["object"]

    {:ok, patient} = get_patient_info(integration, payload["patient"])
    {:ok, doctor} = get_doctor_info(integration, payload["doctor"])

    patient_name = "#{patient["first_name"]} #{patient["last_name"]}"
    doctor_name = "#{doctor["first_name"]} #{doctor["last_name"]}"
    medication_name = value_or_na(payload["name"])
    indication = value_or_na(payload["indication"])

    message = """
    Event: Patient medication modified
    Patient: #{patient_name}
    Doctor: #{doctor_name}
    Medication: #{medication_name}
    Indication: #{indication}
    """

    if integration.settings["patientMedicationModify"] do
      Bot.post_message(integration.team_id, integration.group_id, message)
    end
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

  def get_patient_info(integration, patient_id) do
    api_url = "https://drchrono.com/api/patients/#{patient_id}"
    api_headers = headers(integration)
    IO.inspect(api_headers)

    http_get(api_url, api_headers)
    |> IO.inspect()
  end

  def get_doctor_info(integration, doctor_id) do
    api_url = "https://drchrono.com/api/doctors/#{doctor_id}"
    api_headers = headers(integration)
    http_get(api_url, api_headers)
  end

  def headers(integration) do
    {:ok, token} = Token.for_integration(integration)
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

  def init_integration(integration, code) do
    Logger.info("[dr-chrono] [integration-#{integration.id}] Authenticating with drchrono.")

    {:ok, _credentials} = Token.create_access_token(integration, code)
    Logger.info("[dr-chrono] [integration-#{integration.id}] Authenticated successfully.")

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
