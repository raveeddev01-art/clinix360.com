defmodule StitchEngage.Mobile.ConversationNotificationView do
  alias Pigeon.{APNS}

  alias Stitch.{
    Accounts.User,
    Engage.ConversationMessage,
    Engage.Inbox,
    Patient,
    Mobile.PatientDevice,
    Mobile.Device,
    Repo
  }

  alias StitchEngage.{
    Web.Api.V1.ConversationMessageView,
    Mobile.ConversationNotificationView
  }

  @apns_engage_topic Application.get_env(:stitch_web, :apns_engage_topic)

  defstruct conversation_message: nil,
            patient: nil,
            provider: nil,
            conversation_message_author: nil,
            inbox: nil,
            patient_device: nil,
            provider_device: nil

  @type t :: %ConversationNotificationView{
          conversation_message: ConversationMessage.t() | nil,
          patient: Patient.t() | nil,
          provider: User.t() | nil,
          conversation_message_author: Patient.t() | User.t() | nil,
          inbox: Inbox.t() | nil,
          patient_device: PatientDevice.t() | nil,
          provider_device: Device.t() | nil
        }

  def new(map) do
    notification = %ConversationNotificationView{}
    struct(notification, map)
  end

  @spec conversation_message_notification(ConversationNotificationView.t()) :: any
  def conversation_message_notification(notification) do
    import APNS.Notification

    message_body = text_body(notification)
    device = notification.patient_device || notification.provider_device

    message_body
    |> new(device.token, @apns_engage_topic)
    |> put_alert(%{
      "title" => title(notification),
      "body" => message_body
    })
    |> put_sound("chime")
    |> put_custom(%{
      ejson: sanitize_notification_payload(notification.conversation_message),
      device_id: device.id,
      patient_id: notification.patient && notification.patient.id,
      provider_id: notification.provider && notification.provider.id,
      conversation_message_id: notification.conversation_message.id
    })
  end

  defp text_body(notification) do
    author = notification.conversation_message_author
    "#{author.first_name} #{author.last_name} sent a new conversation message."
  end

  defp title(_notification) do
    "New Message"
  end

  defp sanitize_notification_payload(conversation_message) do
    conversation_message
    |> Repo.preload(conversation: :inbox)
    |> ConversationMessageView.conversation_message_json()
    |> Map.drop([:text_content, :fields])
  end
end
