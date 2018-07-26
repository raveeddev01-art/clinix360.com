defmodule StitchEngage.Web.ConversationMessageEventsService do
  alias Stitch.{
    Engage.ConversationQueries,
    TimedMessage
  }

  def conversation_message_creation_events(conversation, conversation_message) do
    receivers_set = receivers(conversation, conversation_message) |> IO.inspect()

    StitchEngage.Mobile.PushNotification.notifications_for_conversation_message(
      conversation_message,
      receivers_set.mobile
    )

    send_emails(
      conversation_message,
      receivers_set.email
    )
  end

  # Note: this is a simplified version for V1.
  # TODO: add activity tracking, queueing, and user notification preferences.
  def send_emails(conversation_message, %{
        patients: patients,
        providers: providers
      }) do
    Enum.each(providers, fn provider ->
      TimedMessage.Event.new_conversation_message_for_provider(provider, conversation_message)
    end)

    Enum.each(patients, fn patient ->
      TimedMessage.Event.new_conversation_message_for_patient(patient, conversation_message)
    end)
  end

  # Note: this is a simplified version for V1.
  # TODO: add activity tracking, queueing, and user notification preferences.
  def receivers(conversation, conversation_message) do
    patients = ConversationQueries.conversation_patients(conversation)

    patients =
      Enum.filter(
        patients,
        &(!(conversation_message.patient && &1.id == conversation_message.patient.id))
      )

    providers = ConversationQueries.conversation_providers(conversation)

    providers =
      Enum.filter(
        providers,
        &(!(conversation_message.provider && &1.id == conversation_message.provider.id))
      )

    %{
      mobile: %{
        patients: patients,
        providers: providers
      },
      email: %{
        patients: patients,
        providers: providers
      }
    }
  end
end
