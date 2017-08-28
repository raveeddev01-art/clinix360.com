defmodule Stitch.Message do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{Repo, Message}

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
    users = Repo.preload(group, :users).users

    mentioned_user_ids = Stitch.Message.Mention.notify_user_ids(users, user, text_content)

    Repo.transaction fn ->
      message_insert = %Message{group_id: group_id, user_id: user.id}
      |> changeset(%{text_content: text_content, type: "chat", mentioned_user_ids: mentioned_user_ids})
      |> Repo.insert

      case message_insert do
        {:ok, message} ->
          mentioned_user_id = %{message.id => "true"}

          Stitch.GroupUser
          |> where([gu], gu.group_id == ^group.id)
          |> where([gu], gu.user_id in ^mentioned_user_ids)
          |> update([gu], set: [mentioning_message_ids: fragment("? || ?", gu.mentioning_message_ids, ^mentioned_user_id)])
          |> Repo.update_all([], returning: true)

          message
        {:error, changeset} ->
          Repo.rollback(changeset)
      end
    end
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

    previous_mentioned_user_ids = message.mentioned_user_ids
    mentioned_user_ids = Stitch.Message.Mention.notify_user_ids(users, author, attributes["text_content"])

    Repo.transaction fn ->
      message_update = message
      |> user_edit_changeset(%{text_content: attributes["text_content"], mentioned_user_ids: mentioned_user_ids})
      |> Repo.update

      case message_update do
        {:ok, message} ->
          Stitch.GroupUser
          |> where([gu], gu.group_id == ^group.id)
          |> where([gu], gu.user_id in ^previous_mentioned_user_ids)
          |> update([gu], set: [mentioning_message_ids: fragment("? - ?", gu.mentioning_message_ids, ^Integer.to_string(message.id))])
          |> Repo.update_all([], returning: true)

          mentioned_user_id = %{message.id => "true"}

          Stitch.GroupUser
          |> where([gu], gu.group_id == ^group.id)
          |> where([gu], gu.user_id in ^mentioned_user_ids)
          |> update([gu], set: [mentioning_message_ids: fragment("? || ?", gu.mentioning_message_ids, ^mentioned_user_id)])
          |> Repo.update_all([], returning: true)

          message
        {:error, changeset} ->
          Repo.rollback(changeset)
      end
    end
  end

  def delete(message) do
    group = Stitch.GroupQueries.get_by_id(message.group_id)
    users = Repo.preload(group, :users).users

    Repo.transaction fn ->
      Stitch.GroupUser
      |> where([gu], gu.group_id == ^group.id)
      |> where([gu], gu.user_id in ^message.mentioned_user_ids)
      |> update([gu], set: [mentioning_message_ids: fragment("? - ?", gu.mentioning_message_ids, ^Integer.to_string(message.id))])
      |> Repo.update_all([], returning: true)

      message |> Repo.delete
    end
  end

  def read_mentions(user, []), do: {:ok, nil}
  def read_mentions(user, [message_id|_] = message_ids) do
    message = Repo.get(Message, message_id)
    group = Repo.preload(message, :group).group
    read_mentions(group, user, message_ids)
  end
  def read_mentions(group, user, message_ids) do
    ids = "#{message_ids |> Enum.join(" - ")}"
    Stitch.GroupUser
    |> where([gu], gu.group_id == ^group.id)
    |> where([gu], gu.user_id == ^user.id)
    |> update([gu], set: [mentioning_message_ids: fragment("? - ?", gu.mentioning_message_ids, ^ids)])
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

    read_mentions(user, message_ids)
    Message
    |> where([m], m.id in ^message_ids and m.user_id != ^user.id)
    |> where([m], not fragment("? \\? ?", m.read_status, ^to_string(user.id)))
    |> update([m], set: [read_status: fragment("? || ?", m.read_status, ^value)])
    |> Repo.update_all([], returning: true)
  end
end
