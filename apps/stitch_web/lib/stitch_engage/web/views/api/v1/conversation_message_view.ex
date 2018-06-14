defmodule StitchEngage.Web.Api.V1.ConversationMessageView do
  use Stitch.Web, :view

  def render("index.json", %{conversations: conversation_messages}) do
    conversation_messages_json(conversation_messages)
  end

  def render("show.json", %{conversation_message: conversation_message}) do
    conversation_message_json(conversation_message)
  end

  def conversation_messages_json(conversation_messages) do
    Enum.map(conversation_messages, &conversation_message_json/1)
  end

  defp conversation_message_json(conversation_message) do
    %{
      id: conversation_message.id,
      text_content: conversation_message.text_content
    }
  end
end
