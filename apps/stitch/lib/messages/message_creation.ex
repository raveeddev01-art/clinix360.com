defmodule Stitch.Message.MessageCreation do
  use Ecto.Schema
  import Ecto.Changeset
  alias Ecto.Multi

  alias Stitch.{
    Accounts.User,
    Files.Upload,
    Files.UploadComment,
    Files.FileAuthorization,
    GroupUser,
    Message,
    Message.Mention,
    Message.Notification,
    Mobile.NotificationQueue,
    ReadStatus,
    Repo
  }

  alias Stitch.Analytics.Message, as: MessageAnalytics

  @spec create(Group.t(), User.t(), map, map, Upload.t(), UploadComment.t(), map | nil) ::
          {:ok, map} | {:error, atom, Ecto.Changeset.t(), any}

  @spec create(Group.t(), User.t(), map, map | nil) ::
          {:ok, map} | {:error, atom, Ecto.Changeset.t(), any}

  def create(group, user, attrs, presence \\ %{})

  def create(
        group,
        user,
        %{"type" => "file_comment"} = attrs,
        presence,
        upload,
        upload_comment,
        opts
      ) do
    with {:authorized, true} <- {:authorized, FileAuthorization.can_view?(upload, user)} do
      message = %Message{group: group, user: user, upload: upload, parent_message: upload_comment}
      attrs = Map.merge(attrs, %{"fields" => Upload.fields(upload)})
      do_create(message, attrs, presence, opts)
    else
      _ ->
        changeset = %Message{} |> change() |> add_error(:upload_id, "not found")
        {:error, :message, changeset, nil}
    end
  end

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

  def create(group, user, %{"type" => "call", "call_id" => call_id} = attrs, presence) do
    message = %Message{group: group, user: user, call_id: call_id}
    do_create(message, attrs, presence)
  end

  def create(group, user, %{"type" => "meet_link"} = attrs, presence) do
    message = %Message{group: group, user: user}
    do_create(message, attrs, presence)
  end

  # will use when thread key sent from FE
  def create(message, user, %{"text_content" => _, "thread" => true} = attrs, presence) do
    attrs = Map.put(attrs, "type", "chat")
    message = %Message{parent_message: message, user: user, group: message.group}
    do_create(message, attrs, presence)
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

  def do_create(message, attrs, presence, opts \\ %{}) do
    user = message.user
    group = Repo.preload(message.group, :users)
    users = group.users
    text_content = attrs["text_content"]

    mentioned_user_ids =
      Mention.get_mentioned_user_ids(user, text_content, presence.online, group)

    notify_user_ids =
      Notification.notify_user_ids(group, user, mentioned_user_ids, presence.active)
      |> thread_notify_user_ids(message)

    {read_status, recipients} = ReadStatus.get_read_status(:message, users, user)

    attrs =
      attrs
      |> Map.merge(%{
        "mentioned_user_ids" => mentioned_user_ids,
        "read_status" => read_status
      })

    mention_users = Message.mention_users(group, mentioned_user_ids, recipients)
    increment_unread_counter = ReadStatus.increment_unread_counter(:message, group.id, recipients)

    last =
      if opts[:silent] == true do
        Multi.new()
        |> Multi.insert(:message, Message.message_changeset(message, attrs))
        |> Repo.transaction()
        |> silent_post_creation()
      else
        if attrs["type"] != "file_comment" do
          Multi.new()
          |> Multi.insert(:message, Message.message_changeset(message, attrs))
          |> Multi.update_all(:mention_users, mention_users, [])
          |> Multi.update_all(:increment_unread_counter, increment_unread_counter, [])
          |> multi_mark_as_read_on_creation_if_member(group.id, user.id, :message)
          |> Repo.transaction()
          |> post_creation(notify_user_ids)
        end
      end
  end

  def multi_mark_as_read_on_creation_if_member(multi, group_id, user_id, :message) do
    if GroupUser.get(group_id, user_id) do
      multi
      |> ReadStatus.mark_as_read_on_creation(group_id, user_id, :message)
    else
      multi
    end
  end

  def post_creation({:ok, %{message: message} = result_map}, notify_user_ids) do
    MessageAnalytics.track_message_sent(message, message.user, message.group)
    NotificationQueue.async_enqueue_for_users(notify_user_ids.mobile_active, message.id)
    Stitch.Elasticsearch.MessageSearch.add_to_index(message)
    Stitch.AnalyticsMessageCount.create(message)
    result_map = Map.put(result_map, :notify_user_ids, notify_user_ids)
    {:ok, result_map}
  end

  def post_creation(error, _notify_user_ids), do: error

  def silent_post_creation({:ok, result_map}) do
    notify_user_ids = %{
      mobile: [],
      desktop: [],
      email: []
    }

    result_map = Map.put(result_map, :notify_user_ids, notify_user_ids)

    {:ok, result_map}
  end

  def silent_post_creation(error), do: error

  def thread_notify_user_ids(
        notify_user_ids,
        %Message{parent_message: parent_message} = message
      ) do
    thread_reply_notify_ids =
      Map.get(parent_message, :thread_messages, [])
      |> case do
        [] ->
          []

        thread_messages ->
          thread_messages
          |> Enum.map(fn tm -> tm.user_id end)
          |> insert(parent_message.user_id)
          |> Enum.uniq()
          |> List.delete(message.user.id)
      end

    %{
      desktop: Enum.uniq(notify_user_ids.desktop ++ thread_reply_notify_ids),
      mobile: Enum.uniq(notify_user_ids.mobile ++ thread_reply_notify_ids),
      mobile_active: notify_user_ids.mobile_active,
      email: thread_reply_notify_ids
    }
  end

  defp insert(list, item), do: list ++ [item]
end
