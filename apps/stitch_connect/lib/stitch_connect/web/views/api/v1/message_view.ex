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
      user_id: message.user_id,
      group_id: message.group_id,
      deleted: message.deleted,
      text_content: message.text_content,
      fields: message.fields,
      inserted_at: message.inserted_at,
      starred: Map.get(message, :starred, :false),
      pinned: message.pinned,
      pinned_by: pinned_by_info(message),
      pinned_at: message.pinned_at
    }
  end

  def pinned_by_info(%{pinned_by_id: nil}), do: nil
  def pinned_by_info(%{pinned_by: pinned_by}) do
    %{ id: pinned_by.id, first_name: pinned_by.first_name, last_name: pinned_by.last_name }
  end
end
