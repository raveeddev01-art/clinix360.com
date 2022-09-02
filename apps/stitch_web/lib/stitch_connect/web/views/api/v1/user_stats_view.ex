defmodule StitchConnect.Web.Api.V1.UserStatsView do
  use Stitch.Web, :view
  alias Stitch.Message

  def render("unread.json", %{messages: messages}) do
    Enum.map(messages, &message_json(&1))
  end

  def message_json(message) do
    %{
      id: message.id,
      user_id: message.user_id,
      user: user_info(message),
      group_id: message.group_id,
      fields: message.fields,
      deleted: message.deleted,
      text_content: message.text_content,
      inserted_at: message.inserted_at,
      updated_at: message.updated_at,
      starred: Map.get(message, :starred, false),
      pinned_by_id: message.pinned_by_id,
      pinned: message.pinned,
      pinned_by: pinned_by_info(message),
      pinned_at: message.pinned_at,
      edited: !!message.edited_at,
      edited_at: message.edited_at,
      read_status: message.read_status,
      reactions_web: Map.get(message, :reactions, %{}),
      mentioned_user_ids: message.mentioned_user_ids,
      link_previews: message.link_previews,
      request_id: message.request_id,
      highlighted_text_content: message.highlighted_text_content,
      upload_id: message.upload_id,
      upload_ids: message.upload_ids,
      notify_user_ids: message.notify_user_ids,
      thread_messages: (if Ecto.assoc_loaded?(message.thread_messages) == true, do: Enum.map(message.thread_messages, &thread_message_json(&1)), else: []),
      thread_messages_count: (if Ecto.assoc_loaded?(message.thread_messages) == true, do: Enum.count(message.thread_messages), else: 0)
    }
  end

  def thread_message_json(message) do
    %{
      id: message.id,
      user_id: message.user_id,
      group_id: message.group_id,
      fields: message.fields,
      deleted: message.deleted,
      text_content: text_content(message),
      inserted_at: message.inserted_at,
      updated_at: message.updated_at,
      pinned_by_id: message.pinned_by_id,
      pinned: message.pinned,
      pinned_by: pinned_by_info(message),
      pinned_at: message.pinned_at,
      edited: !!message.edited_at,
      edited_at: message.edited_at,
      read_status: message.read_status,
      reactions_web: Message.Reaction.group_reactions(message.reactions),
      mentioned_user_ids: message.mentioned_user_ids,
      link_previews: message.link_previews,
      request_id: message.request_id,
      highlighted_text_content: message.highlighted_text_content,
      upload_id: message.upload_id,
      upload_ids: message.upload_ids,
    }
  end


  def text_content(message), do: message.text_content

  def user_info(nil), do: nil

  def user_info(%{user: %Ecto.Association.NotLoaded{}} = message) do
    user = Stitch.UserQueries.get_by_id(message.user_id)
    %{id: user.id, first_name: user.first_name, last_name: user.last_name}
  end

  def user_info(%{user: user}) do
    %{id: user.id, first_name: user.first_name, last_name: user.last_name}
  end

  def pinned_by_info(%{pinned_by_id: nil}), do: nil

  def pinned_by_info(%{pinned_by: %Ecto.Association.NotLoaded{}}), do: nil

  def pinned_by_info(%{pinned_by: pinned_by}) do
    %{id: pinned_by.id, first_name: pinned_by.first_name, last_name: pinned_by.last_name}
  end
end
