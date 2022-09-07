defmodule StitchConnect.Web.Api.V1.UserStatsView do
  use Stitch.Web, :view
  alias Stitch.Message
  alias Stitch.{
    Files.Upload,
    Web.UrlService
  }

  def render("user_uploads.json", %{files: files}) do
    Enum.map(files, &file_json/1)
  end

  def file_json(file) do
    %{
      id: file.id,
      filename: file.filename,
      public: file.public,
      public_token: file.public_token,
      shared_in: file.shared_in,
      user_id: file.user_id,
      inserted_at: file.inserted_at,
      updated_at: file.updated_at,
      mimetype: file.mimetype,
      filetype: file.filetype,
      size_in_bytes: file.size_in_bytes,
      preview_url: preview_url(file),
      preview_height: file.preview_height,
      preview_width: file.preview_width,
      encoded_id: Upload.encode_url_id(file),
      url: UrlService.file_download_url(file),
      public_url: public_url(file),
      comment_count: file.comment_count,
      starred: Map.get(file, :starred, false)
    }
  end

  def public_url(%Upload{public_token: token} = file) when not is_nil(token) do
    UrlService.public_download_page(file, token)
  end

  def public_url(_upload), do: nil

  def preview_url(file) do
    UrlService.file_preview_url(file)
  end

  def render("user_groups.json", %{user_groups: user_groups}) do
    Enum.map(user_groups, &group_user_json/1)
  end

  def group_user_json(user_groups) do
    %{
      id: user_groups.id,
      group_id: user_groups.group_id,
      group: group_json(user_groups.group),
      is_hidden: user_groups.is_hidden,
      is_favorite: user_groups.is_favorite,
      unread_messages_count: user_groups.unread_messages_count,
      mentions_count: user_groups.mentions_count,
      last_read_at: user_groups.last_read_at,
      inserted_at: user_groups.inserted_at,
      updated_at: user_groups.updated_at,
      mobile_notification_preference: user_groups.mobile_notification_preference,
      desktop_notification_preference: user_groups.desktop_notification_preference,
      user_id: user_groups.user_id

    }
  end

  def group_json(group) do
    %{
      name: group.name,
      slug: group.slug,
      public: group.public,
      description: group.description,
      is_default: group.is_default,
      creator_user_id: group.creator_user_id
    }
  end

  def render("starred.json", %{starred_messages: starred_messages}) do
    Enum.map(starred_messages, &starred_message_json/1)
  end

  def starred_message_json(starred_item) do
    %{
      id: starred_item.id,
      text_content: starred_item.text_content,
      user: user_info(starred_item),
      inserted_at: starred_item.inserted_at,
      group_id: starred_item.group_id,
      type: starred_item.type
    }
  end

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
