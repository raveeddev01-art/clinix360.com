defmodule Stitch.TimedMessage.ConversationMessageForProvider do
  @behaviour Stitch.TimedMessage.WorkerEmail
  use Bamboo.Phoenix, view: Stitch.EmailView

  alias Stitch.{
    Accounts.User,
    Engage.ConversationMessage,
    Engage.ConversationMessageQueries,
    UserQueries
  }

  def subject(_data) do
    "New conversation message"
  end

  def load_data(data) do
    %{
      "receiving_provider_id" => receiving_provider_id,
      "conversation_message_id" => conversation_message_id
    } = data

    receiving_provider = UserQueries.get_by_id(receiving_provider_id)

    conversation_message =
      ConversationMessageQueries.get_by_id(conversation_message_id, preload_assoc: true)

    conversation_message_author = ConversationMessage.get_author(conversation_message)

    data =
      Map.merge(data, %{
        "user" => receiving_provider,
        "conversation_message" => conversation_message,
        "conversation_message_author" => conversation_message_author
      })

    {:ok, data}
  end

  def send_if(%{"user" => receiving_provider}) do
    if User.is_active?(receiving_provider), do: :ok, else: :not_sendable
  end

  def template_vars(email, data) do
    author = data["conversation_message_author"]

    email
    |> assign(:author_full_name, "#{author.first_name} #{author.last_name}")
  end
end
