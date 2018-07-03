defmodule Stitch.Drchrono do
  alias Stitch.Drchrono.{Bot, Token}
  alias Stitch.{Repo, Integration}
  import Ecto.Query
  require Logger

  defp value_or_na(nil), do: "N/A"

  defp value_or_na(value) do
    if value == "" do
      "N/A"
    else
      value
    end
  end

  defp format_scheduled_time(scheduled_time, format) do
    with {:ok, datetime} <- Timex.parse(scheduled_time, "{ISO:Extended}"),
         {:ok, time_string} <- Timex.format(datetime, format) do
      time_string
    else
      _ -> ""
    end
  end

  def handle_webhook(integration, "APPOINTMENT_CREATE", params) do
    payload = params["object"]

    {:ok, patient} = get_patient_info(integration, payload["patient"])
    {:ok, doctor} = get_doctor_info(integration, payload["doctor"])

    scheduled_date =
      value_or_na(format_scheduled_time(payload["scheduled_time"], "{0M}-{D}-{YYYY}"))

    scheduled_time =
      value_or_na(format_scheduled_time(payload["scheduled_time"], "{h24}:{m} {AM}"))

    reason = value_or_na(payload["reason"])
    duration = value_or_na(payload["duration"])
    notes = value_or_na(payload["notes"])

    integration_metadata = %{
      integration: %{
        type: "drchrono",
        data: %{
          username: integration.credentials["username"],
          type: "appointments",
          id: payload["id"]
        }
      }
    }

    message = """
    *Event*: Appointment created
    *Patient*: #{patient["first_name"]} #{patient["last_name"]}
    *Doctor*: #{doctor["first_name"]} #{doctor["last_name"]}
    *Scheduled*: #{scheduled_date}
    *Time*: #{scheduled_time}
    *Reason*: #{reason}
    *Duration*: #{duration} minutes
    *Notes*: #{notes}
    """

    if integration.settings["appointmentCreate"] do
      Bot.post_message(integration.team_id, integration.group_id, message, integration_metadata)
    end
  end

  def handle_webhook(integration, "APPOINTMENT_MODIFY", params) do
    payload = params["object"]

    {:ok, patient} = get_patient_info(integration, payload["patient"])
    {:ok, doctor} = get_doctor_info(integration, payload["doctor"])

    scheduled_date =
      value_or_na(format_scheduled_time(payload["scheduled_time"], "{0M}-{D}-{YYYY}"))

    scheduled_time =
      value_or_na(format_scheduled_time(payload["scheduled_time"], "{h24}:{m} {AM}"))

    reason = value_or_na(payload["reason"])
    duration = value_or_na(payload["duration"])
    notes = value_or_na(payload["notes"])

    integration_metadata = %{
      integration: %{
        type: "drchrono",
        data: %{
          username: integration.credentials["username"],
          type: "appointments",
          id: payload["id"]
        }
      }
    }

    message = """
    *Event*: Appointment modified
    *Patient*: #{patient["first_name"]} #{patient["last_name"]}
    *Doctor*: #{doctor["first_name"]} #{doctor["last_name"]}
    *Scheduled*: #{scheduled_date}
    *Time*: #{scheduled_time}
    *Reason*: #{reason}
    *Duration*: #{duration} minutes
    *Notes*: #{notes}
    """

    if integration.settings["appointmentModify"] do
      Bot.post_message(integration.team_id, integration.group_id, message, integration_metadata)
    end
  end

  def handle_webhook(integration, "APPOINTMENT_DELETE", params) do
    payload = params["object"]

    scheduled_date =
      value_or_na(format_scheduled_time(payload["scheduled_time"], "{0M}-{D}-{YYYY}"))

    scheduled_time =
      value_or_na(format_scheduled_time(payload["scheduled_time"], "{h24}:{m} {AM}"))

    reason = value_or_na(payload["reason"])
    duration = value_or_na(payload["duration"])
    notes = value_or_na(payload["notes"])

    message = """
    *Event*: Appointment deleted
    *Scheduled*: #{scheduled_date}
    *Time*: #{scheduled_time}
    *Reason*: #{reason}
    *Duration*: #{duration} minutes
    *Notes*: #{notes}
    """

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

    integration_metadata = %{
      integration: %{
        type: "drchrono",
        data: %{
          username: integration.credentials["username"],
          type: "patients",
          id: payload["id"]
        }
      }
    }

    message = """
    *Event*: Patient created
    *Patient*: #{patient_name}
    *Doctor*: #{doctor_name}
    *Home phone*: #{home_phone}
    *Cell phone*: #{cell_phone}
    """

    if integration.settings["patientCreate"] do
      Bot.post_message(integration.team_id, integration.group_id, message, integration_metadata)
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

    integration_metadata = %{
      integration: %{
        type: "drchrono",
        data: %{
          username: integration.credentials["username"],
          type: "patients",
          id: payload["id"]
        }
      }
    }

    message = """
    *Event*: Patient modified
    *Patient*: #{patient_name}
    *Doctor*: #{doctor_name}
    *Home phone*: #{home_phone}
    *Cell phone*: #{cell_phone}
    """

    if integration.settings["patientModify"] do
      Bot.post_message(integration.team_id, integration.group_id, message, integration_metadata)
    end
  end

  def handle_webhook(integration, "PATIENT_PROBLEM_CREATE", params) do
    payload = params["object"]

    {:ok, patient} = get_patient_info(integration, payload["patient"])
    {:ok, doctor} = get_doctor_info(integration, payload["doctor"])

    patient_name = "#{patient["first_name"]} #{patient["last_name"]}"
    doctor_name = "#{doctor["first_name"]} #{doctor["last_name"]}"

    message = """
    *Event*: Patient problem created
    *Patient*: #{patient_name}
    *Doctor*: #{doctor_name}
    *Name*: #{value_or_na(payload["name"])}
    *Notes*: #{value_or_na(payload["notes"])}
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
    *Event*: Patient problem modified
    *Patient*: #{patient_name}
    *Doctor*: #{doctor_name}
    *Name*: #{value_or_na(payload["name"])}
    *Notes*: #{value_or_na(payload["notes"])}
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
    *Event*: Patient allergy created
    *Patient*: #{patient_name}
    *Doctor*: #{doctor_name}
    *Reaction*: #{reaction}
    *Notes*: #{notes}
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
    *Event*: Patient allergy modified
    *Patient*: #{patient_name}
    *Doctor*: #{doctor_name}
    *Reaction*: #{reaction}
    *Notes*: #{notes}
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
    *Event*: Patient medication created
    *Patient*: #{patient_name}
    *Doctor*: #{doctor_name}
    *Medication*: #{medication_name}
    *Indication*: #{indication}
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
    *Event*: Patient medication modified
    *Patient*: #{patient_name}
    *Doctor*: #{doctor_name}
    *Medication*: #{medication_name}
    *Indication*: #{indication}
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

  def get_current_user_info(integration) do
    api_url = "https://drchrono.com/api/users/current"
    api_headers = headers(integration)
    http_get(api_url, api_headers)
  end

  def headers(integration) do
    {:ok, token} = Token.for_integration(integration)
    [Authorization: "Bearer #{token}"]
  end

  def http_get(api_url, headers) do
    case HTTPoison.get(api_url, headers, follow_redirect: true) do
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

    Logger.info("[dr-chrono] [integration-#{integration.id}] Saving username.")

    integration = Repo.get(Integration, integration.id)
    {:ok, user} = get_current_user_info(integration)

    credentials =
      integration.credentials
      |> Map.put("username", user["username"])

    changeset = Ecto.Changeset.change(integration, %{credentials: credentials})
    Repo.update!(changeset)

    :ok
  end
end
