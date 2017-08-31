defmodule Stitch.Message do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
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
    |> cast(params, [:fields, :type, :text_content])
    |> validate_required([:fields, :type])
    |> validate_inclusion(:type, @valid_types)
  end

  def create(group_id, user, %{"type" => "upload", "text_content" => text_content, "fields" => fields}) do
    %Message{group_id: group_id, user_id: user.id}
    |> upload_changeset(%{text_content: text_content, fields: fields, type: "upload"})
    |> Repo.insert
  end

  def create(group_id, user, %{"type" => "chat", "text_content" => text_content}) do
    group = Stitch.GroupQueries.get_by_id(group_id)
    # users = Repo.preload(group, :users).users
    group_users = GroupUser |> where([g], g.group_id == ^group_id) |> preload(:user) |> Repo.all
    users = group_users |> Enum.map(& &1.user)

    mentioned_user_ids = Stitch.Message.Mention.notify_user_ids(users, user, text_content)
    users_with_all_notification_enabled = GroupUser.users_with_all_notification_enabled(group_users)
    users_with_all_notification_disabled = GroupUser.users_with_all_notification_disabled(group_users)
    notify_user_ids = Enum.uniq(mentioned_user_ids ++ users_with_all_notification_enabled -- users_with_all_notification_disabled)

    Repo.transaction fn ->
      message_insert = %Message{group_id: group_id, user_id: user.id}
      |> changeset(%{text_content: text_content, type: "chat", mentioned_user_ids: mentioned_user_ids})
      |> Repo.insert

      case message_insert do
        {:ok, message} ->
          add_mention_to_users(group, mentioned_user_ids, message)
          send_notifications(notify_user_ids)
          message
        {:error, changeset} ->
          Repo.rollback(changeset)
      end
    end
  end

  def send_notifications(user_ids) do
    nil # TODO
  end

  def create(group_id, user, %{"text_content" => text_content}) do
    create(group_id, user, %{"type" => "chat", "text_content" => text_content})
  end

  def create(group_id, _user, attributes) do
    changeset = %Message{} |> change() |> add_error(:type, "is not supported")
    {:error, changeset}
  end

  def update(message, attributes) do
    group = Stitch.GroupQueries.get_by_id(message.group_id)
    author = Repo.preload(message, :user).user
    users = Repo.preload(group, :users).users
    mentioned_user_ids = Stitch.Message.Mention.notify_user_ids(users, author, attributes["text_content"])
    remove_mention_from_ids = message.mentioned_user_ids -- mentioned_user_ids
    add_mention_to_ids = mentioned_user_ids -- message.mentioned_user_ids
    update_counters_for_user_ids = remove_mention_from_ids ++ add_mention_to_ids
    notify_user_ids = add_mention_to_ids

    Repo.transaction fn ->
      message_update = message
      |> user_edit_changeset(%{text_content: attributes["text_content"], mentioned_user_ids: mentioned_user_ids})
      |> Repo.update

      case message_update do
        {:ok, updated_message} ->
          remove_mention_from_users(group, remove_mention_from_ids, updated_message)
          add_mention_to_users(group, add_mention_to_ids, updated_message)
          updated_message
          %{message: updated_message, mentioned_user_ids: update_counters_for_user_ids, notify_mentioned_user_ids: notify_user_ids}
        {:error, changeset} ->
          Repo.rollback(changeset)
      end
    end
  end

  def delete(message) do
    group = Stitch.GroupQueries.get_by_id(message.group_id)
    users = Repo.preload(group, :users).users

    Repo.transaction fn ->
      remove_mention_from_users(group, message)

      case Repo.delete(message) do
        {:ok, message} -> message
        {:error, changeset} -> Repo.rollback(changeset)
      end
    end
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
    value = %{user.id => DateTime.utc_now}

    read_mentions(message_ids, user.id)
    Message
    |> where([m], m.id in ^message_ids and m.user_id != ^user.id)
    |> where([m], not fragment("? \\? ?", m.read_status, ^to_string(user.id)))
    |> update([m], set: [read_status: fragment("? || ?", m.read_status, ^value)])
    |> Repo.update_all([], returning: true)
  end
end
