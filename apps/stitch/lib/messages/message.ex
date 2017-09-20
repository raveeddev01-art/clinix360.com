defmodule Stitch.Message do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Ecto.Multi
  alias Stitch.{Repo, Message, GroupUser}

  @valid_types ["chat", "system", "upload"]

  schema "messages" do
    belongs_to :user, Stitch.Accounts.User
    belongs_to :group, Stitch.Group
    belongs_to :pinned_by, Stitch.Accounts.User, foreign_key: :pinned_by_id
    field :deleted, :boolean, default: false
    field :edited_at, :utc_datetime
    field :text_content, :string
    field :type, :string
    field :fields, :map
    field :pinned, :boolean
    field :pinned_at, :utc_datetime
    field :read_status, :map, default: %{}
    field :mentioned_user_ids, {:array, :integer}, default: []

    timestamps()
  end

  def changeset(%Stitch.Message{} = struct, params) do
    struct
    |> cast(params, [:user_id, :group_id, :deleted, :text_content, :fields, :type, :pinned, :pinned_by_id, :pinned_at, :mentioned_user_ids])
    |> validate_required([:user_id, :group_id, :deleted, :text_content])
    |> validate_inclusion(:type, @valid_types)
  end

  def user_edit_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, [:text_content, :mentioned_user_ids])
    |> validate_required([:text_content])
    |> put_change(:edited_at, DateTime.utc_now())
  end

  def chat_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, [:type, :text_content, :mentioned_user_ids, :read_status])
    |> validate_required([:type, :text_content])
    |> validate_inclusion(:type, ["chat"])
  end

  def upload_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, [:fields, :type, :text_content, :mentioned_user_ids, :read_status])
    |> validate_required([:fields, :type])
    |> validate_inclusion(:type, ["upload"])
  end

  def create(group_id, user, params, online_in_group \\ [])

  def create(group_id, user, %{"type" => type} = attrs, online_in_group) when type in ["chat", "upload"] do
    group = Stitch.GroupQueries.get_by_id(group_id)
    users = Repo.preload(group, :users).users

    mentioned_user_ids = Stitch.Message.Mention.get_mentioned_user_ids(users, user, attrs["text_content"])
    notify_user_ids = Stitch.Message.Notification.notify_user_ids(group, user, mentioned_user_ids, online_in_group)
    {read_status, recipients} = users |> Enum.reduce({%{}, []}, fn (recipient, {acc_map, acc_list}) ->
      acc_map = if recipient.id == user.id, do: acc_map, else: Map.put(acc_map, to_string(recipient.id), nil)
      acc_list = if recipient.id == user.id, do: acc_list, else: [recipient.id | acc_list]
      {acc_map, acc_list}
    end)

    message_struct = %Message{group_id: group_id, user_id: user.id}
    attrs = Map.merge(attrs, %{"mentioned_user_ids" => mentioned_user_ids, "read_status" => read_status})

    Multi.new
    |> Multi.insert(:message, message_changeset(message_struct, attrs))
    |> Multi.run(:mentions, fn %{message: message} ->
      {:ok, mention_users(message)}
    end)
    |> Multi.run(:increment_unread_counter, fn %{message: message} ->
      {:ok, increment_unread_counter(message, recipients)}
    end)
    |> Multi.run(:notify_user_ids, fn %{message: message} ->
      send_notification_emails(notify_user_ids.desktop, message)
      {:ok, notify_user_ids.desktop}
    end)
    |> Repo.transaction
  end

  def send_notification_emails(user_ids, message) do
    Stitch.EmailNotification.create(message.id, user_ids)
  end

  def create(group_id, user, %{"text_content" => text_content}, online_in_group) do
    create(group_id, user, %{"type" => "chat", "text_content" => text_content}, online_in_group)
  end

  def create(_group_id, _user, _attrs, _online_in_group) do
    changeset = %Message{} |> change() |> add_error(:type, "is not supported")
    {:error, :message, changeset, nil}
  end

  def message_changeset(message, %{"type" => "chat"} = attrs) do
    message |> chat_changeset(attrs)
  end

  def message_changeset(message, %{"type" => "upload"} = attrs) do
    message |> upload_changeset(attrs)
  end

  def update(message, attributes) do
    group = Stitch.GroupQueries.get_by_id(message.group_id)
    author = Repo.preload(message, :user).user
    users = Repo.preload(group, :users).users
    mentioned_user_ids = Stitch.Message.Mention.get_mentioned_user_ids(users, author, attributes["text_content"])

    message
    |> user_edit_changeset(%{text_content: attributes["text_content"], mentioned_user_ids: mentioned_user_ids})
    |> Repo.update
  end

  def delete(message) do
    Multi.new
    |> Multi.run(:remove_mention, fn _ -> {:ok, unmention_users(message)} end)
    |> Multi.delete(:message, message)
    |> Repo.transaction
  end

  def increment_unread_counter(message, user_ids) do
    Stitch.GroupUser
    |> where([gu], gu.group_id == ^message.group_id)
    |> where([gu], gu.user_id in ^user_ids)
    |> update([gu], inc: [unread_messages_count: ^1])
    |> Repo.update_all([], returning: true)
  end

  def mention_users(message) do
    Stitch.GroupUser
    |> where([gu], gu.group_id == ^message.group_id)
    |> where([gu], gu.user_id in ^message.mentioned_user_ids)
    |> update([gu], inc: [mentions_count: ^1])
    |> Repo.update_all([], returning: true)
  end

  def unmention_users(message) do
    Stitch.GroupUser
    |> where([gu], gu.group_id == ^message.group_id)
    |> where([gu], gu.user_id in ^message.mentioned_user_ids)
    |> update([gu], inc: [mentions_count: ^-1])
    |> Repo.update_all([], returning: true)
  end

  def pin(message, user) do
    message
    |> changeset(%{pinned: true, pinned_by_id: user.id, pinned_at: DateTime.utc_now})
    |> Repo.update
  end

  def unpin(message) do
    message
    |> changeset(%{pinned: false, pinned_by_id: nil, pinned_at: nil})
    |> Repo.update
  end

  def mark_as_read(user_id, group_id) do
    Multi.new
    |> Multi.run(:mark_messages_as_read, fn _ -> {:ok, mark_messages_as_read(group_id, user_id)} end)
    |> Multi.run(:update_last_read_at, fn _ -> {:ok, mark_group_as_read(group_id, user_id)} end)
    |> Repo.transaction
  end

  def mark_messages_as_read(group_id, user_id) do
    Message
    |> where([m], m.group_id == ^group_id)
    |> where([m], m.user_id != ^user_id)
    |> where([m], fragment("? @> ?", m.read_status, ^%{to_string(user_id) => nil}))
    |> update([m], set: [read_status: ^%{user_id => DateTime.utc_now}])
    |> Repo.update_all([], returning: true)
  end

  def mark_group_as_read(group_id, user_id) do
    GroupUser
    |> where(group_id: ^group_id, user_id: ^user_id)
    |> update([m], set: [last_read_at: ^DateTime.utc_now, mentions_count: 0, unread_messages_count: 0])
    |> Repo.update_all([], returning: true)
  end

  def find_by_ids(message_ids) do
    Message
    |> where([m], m.id in ^message_ids)
    |> Repo.all
  end
end
