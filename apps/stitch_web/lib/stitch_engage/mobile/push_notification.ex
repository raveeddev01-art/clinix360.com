defmodule StitchEngage.Mobile.PushNotification do
  alias Stitch.{Accounts.User, Group, GroupUser, Message, Mobile, Repo, Patient}
  alias Pigeon.{APNS, FCM}
  alias StitchEngage.Mobile.ConversationNotificationView
  import Ecto.Query
  require Logger
  use Appsignal.Instrumentation.Decorators

  @apns_engage_topic Application.get_env(:stitch_web, :apns_engage_topic)

  def apns_push(notification, opts \\ []) do
    push_fn = Application.get_env(:stitch_web, :apns_push, &APNS.push/2)
    push_fn.(notification, opts)
  end

  def fcm_push(notification, opts \\ []) do
    push_fn = Application.get_env(:stitch_web, :fcm_push, &FCM.push/2)
    push_fn.(notification, opts)
  end

  def notify_patient(%Patient{} = patient, conversation_message) do
    %{"ios" => ios_devices, "android" => android_devices} =
      Mobile.list_patient_devices(patient.id)

    inbox = nil
    conversation_message_author = nil

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
        conversation_message_author: conversation_message_author,
        inbox: inbox
      }
      |> ConversationNotificationView.new()

    notify_patient_ios_devices(ios_devices, conversation_notification)
  end

  defp notify_patient_ios_devices([], conversation_notification), do: nil

  defp notify_patient_ios_devices(ios_devices, conversation_notification) do
    import APNS.Notification

    ios_devices
    |> Enum.map(fn device ->
      %{conversation_notification | patient_device: device}
      |> ConversationNotificationView.conversation_message_notification()
    end)
    |> apns_push(on_response: &handle_apns_push/1, to: :apns_engage)
  end

  # apns push response handlers.
  def handle_apns_push(%{response: :success} = notification) do
    Stitch.Mobile.NotificationLogger.response(notification)
  end

  def handle_apns_push(%{response: response, device_token: token} = notification)
      when response in [:bad_device_token, :unregistered] do
    error = %{response: response, device_token: token, platform: "iOS"}
    Stitch.Mobile.NotificationLogger.response(notification)
    # uncomment atter test
    # Mobile.remove_patient_device("ios", token)
  end

  def handle_apns_push(%{response: response_error, device_token: token} = notification) do
    error = %{response: response_error, device_token: token, platform: "iOS"}
    Stitch.Mobile.NotificationLogger.response(notification)
  end
end
