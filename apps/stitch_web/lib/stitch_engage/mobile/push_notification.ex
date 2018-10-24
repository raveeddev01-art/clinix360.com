defmodule StitchEngage.Mobile.PushNotification do
  alias Stitch.{
    Accounts.User,
    Mobile,
    Patient
  }

  alias Pigeon.{APNS, FCM}
  alias StitchEngage.Mobile.ConversationNotificationView
  require Logger
  use Appsignal.Instrumentation.Decorators

  def notifications_for_conversation_message(conversation_message, %{
        patients: patients,
        providers: providers
      }) do
    notify_patients(patients, conversation_message)
    notify_providers(providers, conversation_message)
  end

  def apns_push(notification, opts \\ []) do
    push_fn = Application.get_env(:stitch_web, :apns_push, &APNS.push/2)
    push_fn.(notification, opts)
  end

  def fcm_push(notification, opts \\ []) do
    push_fn = Application.get_env(:stitch_web, :fcm_push, &FCM.push/2)
    push_fn.(notification, opts)
  end

  def notify_providers(providers, conversation_message) do
    Enum.each(providers, fn provider ->
      notify_provider(provider, conversation_message)
    end)
  end

  def notify_provider(%User{} = provider, conversation_message) do
    %{"ios" => ios_devices, "android" => _android_devices} =
      Mobile.list_user_devices(provider.id)
      |> Enum.group_by(fn device -> device.type end)
      |> Map.put_new("ios", [])
      |> Map.put_new("android", [])

    conversation_message =
      Stitch.Repo.preload(conversation_message, [:patient, :provider, conversation: :inbox])
      |> Map.put(:provider_reactions, [])
      |> Map.put(:patient_reactions, [])

    conversation_message_author = conversation_message.patient || conversation_message.provider
    inbox = conversation_message.conversation.inbox

    conversation_notification =
      %{
        conversation_message: conversation_message,
        patient: nil,
        provider: provider,
        conversation_message_author: conversation_message_author,
        inbox: inbox
      }
      |> ConversationNotificationView.new()

    notify_provider_ios_devices(ios_devices, conversation_notification)
  end

  def notify_patients(patients, conversation_message) do
    Enum.each(patients, fn patient ->
      notify_patient(patient, conversation_message)
    end)
  end

  def notify_patient(%Patient{} = patient, conversation_message) do
    %{"ios" => ios_devices, "android" => _android_devices} =
      Mobile.list_patient_devices(patient.id)

    conversation_message =
      Stitch.Repo.preload(conversation_message, [:patient, :provider, conversation: :inbox])
      |> Map.put(:provider_reactions, [])
      |> Map.put(:patient_reactions, [])

    conversation_message_author = conversation_message.patient || conversation_message.provider
    inbox = conversation_message.conversation.inbox

    conversation_notification =
      %{
        conversation_message: conversation_message,
        patient: patient,
        provider: nil,
        conversation_message_author: conversation_message_author,
        inbox: inbox
      }
      |> ConversationNotificationView.new()

    notify_patient_ios_devices(ios_devices, conversation_notification)
  end

  defp notify_provider_ios_devices([], _conversation_notification), do: nil

  defp notify_provider_ios_devices(ios_devices, conversation_notification) do
    ios_devices
    |> Enum.map(fn device ->
      %{conversation_notification | provider_device: device}
      |> ConversationNotificationView.conversation_message_notification()
    end)
    |> apns_push(on_response: &handle_apns_push/1)
  end

  defp notify_patient_ios_devices([], _conversation_notification), do: nil

  defp notify_patient_ios_devices(ios_devices, conversation_notification) do
    ios_devices
    |> Enum.map(fn device ->
      %{conversation_notification | patient_device: device}
      |> ConversationNotificationView.conversation_message_notification()
    end)
    |> apns_push(on_response: &handle_apns_push/1, to: :apns_engage)
  end

  def handle_apns_push(%{response: :success} = notification) do
    Stitch.Mobile.NotificationLogger.response(notification)
  end

  def handle_apns_push(%{response: response, device_token: token} = notification)
      when response in [:bad_device_token, :unregistered] do
    _error = %{response: response, device_token: token, platform: "iOS"}
    Stitch.Mobile.NotificationLogger.response(notification)
    Mobile.remove_patient_device("ios", token)
  end

  def handle_apns_push(%{response: response_error, device_token: token} = notification) do
    _error = %{response: response_error, device_token: token, platform: "iOS"}
    Stitch.Mobile.NotificationLogger.response(notification)
  end
end
