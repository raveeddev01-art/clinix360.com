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
        IO.inspect("here is messages cretions")
        IO.inspect(upload, label: "here is upload")
    with {:authorized, true} <- {:authorized, FileAuthorization.can_view?(upload, user)} do
      message = %Message{group: group, user: user, upload: upload, messages: upload_comment}
      attrs = Map.merge(attrs, %{"fields" => Upload.fields(upload)})
      do_create(message, attrs, presence, opts)
    else
      _ ->
        changeset = %Message{} |> change() |> add_error(:upload_id, "not found")
        {:error, :message, changeset, nil}
    end
  end

  def create(group, user, %{"type" => "upload", "fields" => fields} = attrs, presence) do
        IO.inspect(group, label: "here is messages cretions 2")
        IO.inspect(user, label: "here is upload 2")
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
# will use when thread key sent from FE
  def create(message, user, %{"text_content" => _, "thread" => true} = attrs, presence) do
    IO.inspect(message, label: "here in text_content")
    attrs = Map.put(attrs, "type", "chat")
    message = %Message{messages: message, user: user, group: message.group}
    do_create(message, attrs, presence)
  end

  def create(group, user, %{"text_content" => _} = attrs, presence) do
    IO.inspect("here in text_content")
    attrs = Map.put(attrs, "type", "chat")
    message = %Message{group: group, user: user}
    # message = %Message{messages: message, user: user, group: message.group}
    do_create(message, attrs, presence)
  end

  def create(_group, _user, _attrs, _presence) do
    changeset = %Message{} |> change() |> add_error(:type, "is not supported")
    {:error, :message, changeset, nil}
  end


  def do_create(message, attrs, presence, opts \\ %{}) do
    IO.inspect(message, label: "message in do-create")
    user = message.user
    group = Repo.preload(message.group, :users)
    # group = ["one"]
    IO.inspect(user, label: "user in do-create ")
    IO.inspect(group, label: "group in do-create ")
    users = group.users
    # users = ["one"]
    IO.inspect(users, label: "users in do-create ")
    text_content = attrs["text_content"]
    IO.inspect(text_content, label: "text_content in do-create ")
    mentioned_user_ids =
      Mention.get_mentioned_user_ids(user, text_content, presence.online, group)
    IO.inspect(mentioned_user_ids, label: "mentioned_user_ids in do-create ")
    notify_user_ids =
      Notification.notify_user_ids(group, user, mentioned_user_ids, presence.active)
    IO.inspect(notify_user_ids, label: "notify_user_ids in do-create ")
    {read_status, recipients} = ReadStatus.get_read_status(:message, users, user)
    IO.inspect(recipients, label: "recipients in do-create ")
    IO.inspect(read_status, label: "read_status in do-create ")
    attrs =
      attrs
      |> Map.merge(%{
        "mentioned_user_ids" => mentioned_user_ids,
        "read_status" => read_status
      })
      IO.inspect(attrs, label: "attrs in do-create ")
    mention_users = Message.mention_users(group, mentioned_user_ids, recipients)
    IO.inspect(mention_users, label: "mention_users in do-create ")
    increment_unread_counter = ReadStatus.increment_unread_counter(:message, group.id, recipients)
    IO.inspect(increment_unread_counter, label: "increment_unread_counter in do-create ")
    last =
    if opts[:silent] == true do
      Multi.new()
      |> Multi.insert(:message, Message.message_changeset(message, attrs))
      |> Repo.transaction()
      |> silent_post_creation()
    else
      IO.inspect("in else statement")
      Multi.new()
      |> Multi.insert(:message, Message.message_changeset(message, attrs))
      |> Multi.update_all(:mention_users, mention_users, [])
      |> Multi.update_all(:increment_unread_counter, increment_unread_counter, [])
      |> multi_mark_as_read_on_creation_if_member(group.id, user.id, :message)
      |> IO.inspect(label: "here is 135 output")
      |> Repo.transaction()
      |> IO.inspect(label: "here is repo error")
      |> post_creation(notify_user_ids)
    end
    IO.inspect(last, label: "last in do-create ")
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
end
