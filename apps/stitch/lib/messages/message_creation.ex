defmodule Stitch.Message.MessageCreation do
  use Ecto.Schema
  import Ecto.Changeset
  alias Ecto.Multi

  alias Stitch.{
    Accounts.User,
    Files.Upload,
    Files.FileQueries,
    Files.FileAuthorization,
    Group,
    Message,
    Message.Mention,
    Message.Notification,
    Mobile.NotificationQueue,
    ReadStatus,
    Repo
  }

  alias Stitch.Analytics.Message, as: MessageAnalytics

  @spec create(Group.t(), User.t(), map, map | nil) ::
          {:ok, map} | {:error, atom, Ecto.Changeset.t(), any}

  def create(group, user, attrs, presence \\ %{})

  def create(group, user, %{"type" => "upload", "fields" => fields} = attrs, presence) do
    with {:ok, upload, _} <- Upload.create_and_share_with_group(group, user, fields) do
      message = %Message{group: group, user: user, upload: upload}
      attrs = Map.merge(attrs, %{"fields" => Upload.fields(upload), "type" => "file_share"})
      do_create(message, attrs, presence)
    else
      _ ->
        changeset = %Message{} |> change() |> add_error(:upload_id, "Error creating file")
        {:error, :message, changeset, nil}
    end
  end

  def create(group, user, %{"type" => "file_share", "upload_id" => upload_id} = attrs, presence) do
    with {:upload, %Upload{} = upload} <- {:upload, FileQueries.get_by_id(upload_id)},
         {:authorized, true} <- {:authorized, FileAuthorization.can_view?(upload, user)} do
      Upload.share_with_group(upload, group)
      message = %Message{group: group, user: user, upload: upload}
      attrs = Map.merge(attrs, %{"fields" => Upload.fields(upload)})
      do_create(message, attrs, presence)
    else
      _ ->
        changeset = %Message{} |> change() |> add_error(:upload_id, "not found")
        {:error, :message, changeset, nil}
    end
  end

  def create(group, user, %{"type" => "file_comment", "upload_id" => upload_id} = attrs, presence) do
    with {:upload, %Upload{} = upload} <- {:upload, FileQueries.get_by_id(upload_id)},
         {:authorized, true} <- {:authorized, FileAuthorization.can_view?(upload, user)} do
      # Upload.share_with_group(upload, group)
      message = %Message{group: group, user: user, upload: upload}
      attrs = Map.merge(attrs, %{"fields" => Upload.fields(upload)})
      do_create(message, attrs, presence)
    else
      _ ->
        changeset = %Message{} |> change() |> add_error(:upload_id, "not found")
        {:error, :message, changeset, nil}
    end
  end

  def create(group, user, %{"text_content" => _} = attrs, presence) do
    attrs = Map.put(attrs, "type", "chat")
    message = %Message{group: group, user: user}
    do_create(message, attrs, presence)
  end

  def create(_group, _user, _attrs, _presence) do
    changeset = %Message{} |> change() |> add_error(:type, "is not supported")
    {:error, :message, changeset, nil}
  end

  def do_create(message, attrs, presence) do
    user = message.user
    group = Repo.preload(message.group, :users)
    users = group.users
    text_content = attrs["text_content"] || ""

    mentioned_user_ids =
      Mention.get_mentioned_user_ids(user, text_content, presence.online, group)

    notify_user_ids =
      Notification.notify_user_ids(group, user, mentioned_user_ids, presence.active)

    {read_status, recipients} = ReadStatus.get_read_status(:message, users, user)

    attrs =
      attrs
      |> Map.merge(%{
        "mentioned_user_ids" => mentioned_user_ids,
        "read_status" => read_status
      })

    mention_users = Message.mention_users(group, mentioned_user_ids, recipients)

    increment_unread_counter = ReadStatus.increment_unread_counter(:message, group.id, recipients)

    Multi.new()
    |> Multi.insert(:message, Message.message_changeset(message, attrs))
    |> Multi.update_all(:mention_users, mention_users, [])
    |> Multi.update_all(:increment_unread_counter, increment_unread_counter, [])
    |> ReadStatus.mark_as_read_on_creation(group.id, user.id, :message)
    |> Repo.transaction()
    |> post_creation(notify_user_ids)
  end

  def post_creation({:ok, %{message: message} = result_map}, notify_user_ids) do
    MessageAnalytics.track_message_sent(message, message.user, message.group)
    NotificationQueue.async_enqueue_for_users(notify_user_ids.mobile_active, message.id)
    result_map = Map.put(result_map, :notify_user_ids, notify_user_ids)

    {:ok, result_map}
  end

  def post_creation(error, _notify_user_ids), do: error
end
