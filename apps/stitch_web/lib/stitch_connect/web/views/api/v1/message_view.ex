defmodule StitchConnect.Web.Api.V1.MessageView do
  use Stitch.Web, :view
  alias Stitch.Web.Api.V1.MessagesHelper
  alias Stitch.Message
  @endpoint Stitch.Web.Endpoint

  def render("index.json", %{messages: messages} = opts) do
    authenticated_urls = Map.get(opts, :authenticated_urls, false)
    Enum.map(messages, &message_json(&1, authenticated_urls, @endpoint.files_struct_url()))
  end

  def render("starred.json", %{message: message, user_id: user_id}) do
    message_json(message)
    |> Map.put(:starred_by_user_id, user_id)
  end

  def render("show.json", %{message: message} = opts) do
    authenticated_urls = Map.get(opts, :authenticated_urls, false)
    message_json(message, authenticated_urls, @endpoint.files_struct_url())
  end

  def render("feed_surrounding.json", %{
        more_before: more_before,
        more_after: more_after,
        messages: messages
      }) do
    %{
      more_before: more_before,
      more_after: more_after,
      messages: render("index.json", %{messages: messages})
    }
  end

  def render("mark_as_read.json", %{messages_json: messages_json, group_user: group_user}) do
    %{
      messages: messages_json,
      group_id: group_user.group_id,
      last_read_at: group_user.last_read_at,
      mentions_count: group_user.mentions_count,
      unread_messages_count: group_user.unread_messages_count
    }
  end

  def message_json(message), do: message_json(message, false, @endpoint.files_struct_url())
  def message_json(message, true), do: message_json(message, true, @endpoint.files_struct_url())

  def message_json(message, authenticated_url, files_url) do
    %{
      id: message.id,
      user_id: message.user_id,
      user: user_info(message),
      group_id: message.group_id,
      deleted: message.deleted,
      # text_content: text_content(message),
      text_content: message.text_content,
      fields: MessagesHelper.render_fields(message, authenticated_url, files_url) |> IO.inspect(label: "fields in view"),
      type: type(message.type, authenticated_url),
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
      comment_notify_ids: Map.get(message, :comment_notify_ids, default_comment_notify_ids()),
      thread_messages: (if Ecto.assoc_loaded?(message.thread_messages) == true, do: Enum.map(message.thread_messages, &thread_message_json(&1, authenticated_url, @endpoint.files_struct_url())), else: []),
      thread_messages_count: (if Ecto.assoc_loaded?(message.thread_messages) == true, do: Enum.count(message.thread_messages), else: 0)
    }
  end

  def thread_message_json(message, authenticated_url, files_url) do
    %{
      id: message.id,
      user_id: message.user_id,
      fields: MessagesHelper.render_fields(message, authenticated_url, files_url),
      group_id: message.group_id,
      deleted: message.deleted,
      text_content: text_content(message),
      type: type(message.type, authenticated_url),
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

  # TODO: remove `requires_fallback_comment: false` guard on the next release
  # def text_content(%Message{type: "file_share", requires_fallback_comment: false}), do: nil
  def text_content(message), do: message.text_content

  def type("file_share", _), do: "upload"
  def type("file_comment", false), do: "chat"
  def type("file_comment", true), do: "file_comment"
  def type(type, _), do: type

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

  def default_comment_notify_ids(), do: %{desktop: [], mobile: []}

end
