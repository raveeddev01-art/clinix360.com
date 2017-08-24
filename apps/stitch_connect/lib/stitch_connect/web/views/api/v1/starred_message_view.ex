defmodule StitchConnect.Web.Api.V1.StarredMessageView do
  use StitchConnect.Web, :view
  alias StitchConnect.Web.Api.V1.MessageView

  def render("index.json", %{starred_messages: starred_messages}) do
    Enum.map(starred_messages, &starred_message_json/1)
  end

  def starred_message_json(starred_message) do
    %{
      id: starred_message.id,
      text_content: starred_message.text_content,
      user: MessageView.user_info(starred_message),
      inserted_at: starred_message.inserted_at,
    }
  end
end
