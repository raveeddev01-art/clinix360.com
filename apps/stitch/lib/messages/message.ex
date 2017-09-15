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

  def upload_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, [:fields, :type, :text_content, :mentioned_user_ids, :read_status])
    |> validate_required([:fields, :type])
    |> validate_inclusion(:type, @valid_types)
  end

  def create(group_id, user, %{"type" => type} = params, online_in_group \\ []) when type in ["chat", "upload"] do
    group = Stitch.GroupQueries.get_by_id(group_id)
    users = Repo.preload(group, :users).users

    mentioned_user_ids = Stitch.Message.Mention.get_mentioned_user_ids(users, user, params["text_content"])
    notify_user_ids = Stitch.Message.Notification.notify_user_ids(group, user, mentioned_user_ids, online_in_group)
    read_status = users |> Enum.reduce(%{}, fn (recipient, acc) ->
      if recipient.id == user.id, do: acc, else: Map.put(acc, recipient.id, nil)
    end)

    message_struct = %Message{group_id: group_id, user_id: user.id}
    attrs = Map.merge(params, %{"mentioned_user_ids" => mentioned_user_ids, "read_status" => read_status})

    Multi.new
    |> Multi.insert(:message, message_changeset(message_struct, attrs))
    |> Multi.run(:mentions, fn %{message: message} ->
      {:ok, add_mention_to_users(group, mentioned_user_ids, message)}
    end)
    |> Multi.run(:notify_user_ids, fn %{message: message} ->
      {:ok, notify_user_ids.desktop}
    end)
    |> Repo.transaction
  end

  def message_changeset(message, %{"type" => "chat"} = attrs) do
    message |> changeset(attrs)
  end

  def message_changeset(message, %{"type" => "upload"} = attrs) do
    message |> upload_changeset(attrs)
  end

  def create(group_id, user, %{"text_content" => text_content}, online_in_group) do
    create(group_id, user, %{"type" => "chat", "text_content" => text_content}, online_in_group)
  end

  def create(group_id, _user, attributes, _online_in_group) do
    changeset = %Message{} |> change() |> add_error(:type, "is not supported")
    {:error, :message, changeset, nil}
  end

  def update(message, attributes) do
    group = Stitch.GroupQueries.get_by_id(message.group_id)
    author = Repo.preload(message, :user).user
    users = Repo.preload(group, :users).users
    mentioned_user_ids = Stitch.Message.Mention.get_mentioned_user_ids(users, author, attributes["text_content"])

    message_changeset = message
    |> user_edit_changeset(%{text_content: attributes["text_content"], mentioned_user_ids: mentioned_user_ids})

    Multi.new
    |> Multi.update(:message, message_changeset)
    |> Multi.run(:mentions, fn %{message: updated_message} ->
      {_n, _term} = remove_mention_from_users(group, message.mentioned_user_ids -- mentioned_user_ids, updated_message)
      {_n, _term} = add_mention_to_users(group, mentioned_user_ids -- message.mentioned_user_ids, updated_message)
      {:ok, nil}
    end)
    |> Repo.transaction
  end

  def delete(message) do
    group = Stitch.GroupQueries.get_by_id(message.group_id)
    users = Repo.preload(group, :users).users

    Multi.new
    |> Multi.run(:remove_mention, fn _ -> {:ok, remove_mention_from_users(group, message)} end)
    |> Multi.delete(:message, message)
    |> Repo.transaction
  end

  def remove_mention_from_users(group, message) do
    remove_mention_from_users(group, message.mentioned_user_ids, message)
  end

  def remove_mention_from_users(group, user_ids, message) do
    Stitch.GroupUser
    |> where([gu], gu.group_id == ^group.id)
    |> where([gu], gu.user_id in ^user_ids)
    |> update([gu], pull: [mentioning_message_ids: ^message.id])
    |> Repo.update_all([], returning: true)
  end

  def add_mention_to_users(group, mentioned_user_ids, message) do
    Stitch.GroupUser
    |> where([gu], gu.group_id == ^group.id)
    |> where([gu], gu.user_id in ^mentioned_user_ids)
    |> update([gu], set: [
      mentioning_message_ids: fragment("ARRAY(SELECT DISTINCT UNNEST(? || ?))", gu.mentioning_message_ids, ^[message.id])
    ])
    |> Repo.update_all([], returning: true)
  end

  def read_mentions([], _user_id), do: {:ok, nil}

  def read_mentions([message_id|_] = message_ids, user_id) do
    message = Repo.get(Message, message_id)
    group = Repo.preload(message, :group).group
    read_mentions(message_ids, user_id, group.id)
  end

  def read_mentions(message_ids, user_id, group_id) do
    Stitch.GroupUser
    |> where([gu], gu.group_id == ^group_id)
    |> where([gu], gu.user_id == ^user_id)
    |> update([gu], set: [
      mentioning_message_ids: fragment("(select coalesce(array_agg(e), array[]::int[]) from unnest(?) e where e <> all(?))", gu.mentioning_message_ids, ^message_ids)
    ])
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

  def mark_as_read(user, message_ids) do
    message_ids = List.wrap(message_ids)

    read_mentions(message_ids, user.id)
    Message
    |> where([m], m.id in ^message_ids)
    |> _mark_as_read(user.id)
  end

  def mark_as_read_all(user, group_id) do
    # read_mentions(message_ids, user.id)
    Message
    |> where([m], m.group_id == ^group_id)
    |> _mark_as_read(user.id)
  end

  defp _mark_as_read(queryable, user_id) do
    value = %{user_id => DateTime.utc_now}

    queryable
    |> where([m], m.user_id != ^user_id)
    |> where([m], not fragment("? \\? ?", m.read_status, ^to_string(user_id)))
    |> update([m], set: [read_status: fragment("? || ?", m.read_status, ^value)])
    |> Repo.update_all([], returning: true)
  end
end
