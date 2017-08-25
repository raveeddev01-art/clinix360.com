defmodule StitchConnect.Web.Api.V1.MessageView do
  use StitchConnect.Web, :view
  alias Stitch.{Message}

  def render("index.json", %{messages: messages, user_id: user_id}) do
    Enum.map(messages, &message_json(&1, user_id))
  end

  def render("show.json", %{message: message, user_id: user_id}) do
    message_json(message, user_id)
  end

  def message_json(message, user_id) do
    %{
      id: message.id,
      user_id: message.user_id,
      user: user_info(message),
      group_id: message.group_id,
      deleted: message.deleted,
      text_content: message.text_content,
      fields: message.fields,
      type: message.type,
      inserted_at: message.inserted_at,
      starred: Map.get(message, :starred, :false),
      pinned: message.pinned,
      pinned_by: pinned_by_info(message),
      pinned_at: message.pinned_at,
      edited: !!message.edited_at,
      edited_at: message.edited_at,
      read: read(user_id, message),
      read_status: read_status(user_id, message),
    }
  end

  def read(nil, _), do: false
  def read(id, %Message{read_status: read_status}) do
    Map.has_key?(read_status, to_string(id))
  end

  def read_status(user_id, %Message{user_id: user_id, read_status: read_status_map}) do
    Enum.map(read_status_map, fn {id_str, read_at} ->
      %{user_id: String.to_integer(id_str), read_at: read_at}
    end)
  end
  def read_status(_, _), do: nil

  def user_info(%{user: user}) do
    %{ id: user.id, first_name: user.first_name, last_name: user.last_name }
  end

  def pinned_by_info(%{pinned_by_id: nil}), do: nil
  def pinned_by_info(%{pinned_by: pinned_by}) do
    %{ id: pinned_by.id, first_name: pinned_by.first_name, last_name: pinned_by.last_name }
  end
end
