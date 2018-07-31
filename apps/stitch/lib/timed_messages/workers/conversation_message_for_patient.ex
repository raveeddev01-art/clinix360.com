defmodule Stitch.TimedMessage.ConversationMessageForPatient do
  @behaviour Stitch.TimedMessage.WorkerEmail
  use Bamboo.Phoenix, view: Stitch.EmailView

  alias Stitch.{
    Engage.ConversationMessage,
    Engage.ConversationMessageQueries,
    Patient,
    PatientQueries
  }

  def subject(_data) do
    "New conversation message"
  end

  def load_data(data) do
    %{
      "receiving_patient_id" => receiving_patient_id,
      "conversation_message_id" => conversation_message_id
    } = data

    receiving_patient = PatientQueries.get_patient(receiving_patient_id)

    conversation_message =
      ConversationMessageQueries.get_by_id(conversation_message_id, preload_assoc: true)

    conversation_message_author = ConversationMessage.get_author(conversation_message)

    data =
      Map.merge(data, %{
        "user" => receiving_patient,
        "conversation_message" => conversation_message,
        "conversation_message_author" => conversation_message_author
      })

    {:ok, data}
  end

  def send_if(%{"user" => receiving_patient}) do
    if Patient.is_active?(receiving_patient), do: :ok, else: :not_sendable
  end

  def template_vars(email, data) do
    author = data["conversation_message_author"]

    email
    |> assign(:author_full_name, "#{author.first_name} #{author.last_name}")
  end
end
