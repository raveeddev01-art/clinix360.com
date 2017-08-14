defmodule StitchConnect.Web.Api.V1.MessageView do
  use StitchConnect.Web, :view

  def render("index.json", %{messages: messages}) do
    Enum.map(messages, &message_json/1)
  end

  def render("show.json", %{message: message}) do
    message_json(message)
  end

  def message_json(message) do
    %{
      id: message.id,
      user_id: message.user.id,
      group_id: message.group.id,
      deleted: message.deleted,
      text_content: message.text_content,
      fields: message.fields
    }
  end
end