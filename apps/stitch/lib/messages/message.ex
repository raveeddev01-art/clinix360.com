defmodule Stitch.Message do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Ecto.Multi
  alias Stitch.{Repo, Message, Group, GroupUser, GroupQueries, Accounts.User}

  @valid_types ["chat", "system", "upload"]
  @unread_limit 30

  schema "messages" do
    belongs_to :user, Stitch.Accounts.User
    belongs_to :group, Stitch.Group
    belongs_to :pinned_by, Stitch.Accounts.User, foreign_key: :pinned_by_id
    field :request_id, :string
    field :deleted, :boolean, default: false
    field :edited_at, :utc_datetime
    field :text_content, :string
    field :type, :string
    field :fields, :map
    field :pinned, :boolean
    field :pinned_at, :utc_datetime
    field :read_status, :map, default: %{}
    field :mentioned_user_ids, {:array, :integer}, default: []
    field :has_links, :boolean, default: false
    field :link_previews_generated, :boolean, default: false
    embeds_many :link_previews, Message.LinkPreview, on_replace: :delete

    timestamps()
  end

  def changeset(%Message{} = struct, params) do
    struct
    |> cast(params, [:user_id, :group_id, :deleted, :text_content, :fields, :type, :pinned, :pinned_by_id, :pinned_at, :mentioned_user_ids])
    |> validate_required([:user_id, :group_id, :deleted, :text_content])
    |> validate_inclusion(:type, @valid_types)
  end

  def pin_changeset(%Message{} = struct, params) do
    struct
    |> cast(params, [:pinned, :pinned_by_id, :pinned_at])
    |> validate_required([:pinned])
  end

  def user_edit_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, [:text_content, :mentioned_user_ids])
    |> validate_required([:text_content])
    |> check_for_links
    |> put_change(:edited_at, DateTime.utc_now())
  end

  def chat_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, [:type, :request_id, :text_content, :mentioned_user_ids, :read_status])
    |> validate_required([:type, :text_content])
    |> validate_inclusion(:type, ["chat"])
    |> check_for_links
  end

  defp check_for_links(%Ecto.Changeset{valid?: true, changes: %{text_content: text_content}} = changeset) do
    has_links =
      text_content
      |> Message.LinkPreview.get_links
      |> Enum.empty?
      |> Kernel.not

    put_change(changeset, :has_links, has_links)
  end
  defp check_for_links(changeset), do: changeset

  def upload_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, [:fields, :type, :text_content, :mentioned_user_ids, :read_status])
    |> validate_required([:fields, :type])
    |> validate_inclusion(:type, ["upload"])
    |> add_preview()
  end

  def add_preview(%{valid?: true, changes: %{fields: fields}} = changeset) do
    case Stitch.UploadPreview.create_preview(fields) do
      {:ok, preview_metadata} ->
        put_change(changeset, :fields, Map.merge(fields, preview_metadata))
      {:error, _error} ->
        changeset
    end
  end
  def add_preview(changeset), do: changeset

  def system_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, [:fields, :type, :text_content])
    |> validate_required([:fields, :type])
    |> validate_inclusion(:type, ["system"])
  end

  def create(group_id, user, attrs, online_in_group \\ [])

  def create(group_id, user, %{"type" => type} = attrs, online_in_group) when type in ["chat", "upload"] do
    group = GroupQueries.get_by_id(group_id)
    group_user = Repo.get_by(GroupUser, user_id: user.id, group_id: group.id)
    users = Repo.preload(group, :users).users

    analytics_track_message_sent(user, group)

    mentioned_user_ids = Message.Mention.get_mentioned_user_ids(users, user, attrs["text_content"])
    notify_user_ids = Message.Notification.notify_user_ids(group, user, mentioned_user_ids, online_in_group)
    {read_status, recipients} = users |> Enum.reduce({%{}, []}, fn (recipient, {acc_map, acc_list}) ->
      acc_map = if recipient.id == user.id or recipient.disabled, do: acc_map, else: Map.put(acc_map, to_string(recipient.id), nil)
      acc_list = if recipient.id == user.id, do: acc_list, else: [recipient.id | acc_list]
      {acc_map, acc_list}
    end)

    message_struct = %Message{group_id: group_id, user_id: user.id}
    attrs = Map.merge(attrs, %{"mentioned_user_ids" => mentioned_user_ids, "read_status" => read_status})

    Multi.new
    |> Multi.insert(:message, message_changeset(message_struct, attrs))
    |> Multi.update_all(:mention_users, mention_users(group, mentioned_user_ids, recipients), [])
    |> Multi.update_all(:increment_unread_counter, increment_unread_counter(group.id, recipients), [])
    |> mark_as_read_on_creation(group.id, user.id, (group_user.last_read_at || group_user.inserted_at), @unread_limit)
    |> Multi.run(:notify_user_ids, fn %{message: message} ->
      Stitch.EmailNotification.create(message.id, notify_user_ids.email)
      {:ok, notify_user_ids}
    end)
    |> Repo.transaction
  end

  def create(group_id, user, %{"text_content" => _} = attrs, online_in_group) do
    create(group_id, user, Map.put(attrs, "type", "chat"), online_in_group)
  end

  def create(_group_id, _user, _attrs, _online_in_group) do
    changeset = %Message{} |> change() |> add_error(:type, "is not supported")
    {:error, :message, changeset, nil}
  end

  defp analytics_track_message_sent(user, group) do
    Stitch.Task.start(fn ->
      team_id = user.team_id
      team = Stitch.TeamQueries.get_by_id(team_id)
      properties = %{
        "room_id"   => Integer.to_string(group.id),
        "room_slug" => group.slug,
        "team_id"   => Integer.to_string(team.id),
        "team_slug" => team.slug
      }
      Stitch.Analytics.track(user.id, "Message Sent", properties)
    end)
  end

  def message_changeset(message, %{"type" => "chat"} = attrs) do
    message |> chat_changeset(attrs)
  end

  def message_changeset(message, %{"type" => "upload"} = attrs) do
    message |> upload_changeset(attrs)
  end

  def update(message, attributes) do
    group = GroupQueries.get_by_id(message.group_id)
    author = Repo.preload(message, :user).user
    users = Repo.preload(group, :users).users
    mentioned_user_ids = Message.Mention.get_mentioned_user_ids(users, author, attributes["text_content"])

    message
    |> user_edit_changeset(%{text_content: attributes["text_content"], mentioned_user_ids: mentioned_user_ids})
    |> Repo.update
  end

  def delete(message) do
    Multi.new
    |> Multi.update_all(:unmention_users, unmention_users(message), [])
    |> Multi.update_all(:decrement_unread_counter, decrement_unread_counter(message), [])
    |> Multi.delete(:message, message)
    |> Repo.transaction
  end

  def mark_as_read_on_creation(multi, group_id, user_id, last_read_at, unread_limit) do
    if below_unread_limit?(group_id, last_read_at, unread_limit) do
      multi
      |> Multi.update_all(:mark_messages_as_read, mark_messages_as_read(group_id, user_id), [])
      |> Multi.update_all(:mark_group_as_read, mark_group_as_read(group_id, user_id), [])
    else
      multi
    end
  end

  def below_unread_limit?(group_id, timestamp, unread_limit) do
    count =
      Message
      |> where([m], m.group_id == ^group_id)
      |> where([m], m.inserted_at >= ^timestamp)
      |> limit(^unread_limit)
      |> subquery
      |> select([q], count(q.id))
      |> Repo.one

    count < unread_limit
  end

  def increment_unread_counter(group_id, user_ids) do
    GroupUser
    |> where([gu], gu.group_id == ^group_id)
    |> where([gu], gu.user_id in ^user_ids)
    |> update([gu], inc: [unread_messages_count: ^1])
  end

  def decrement_unread_counter(message) do
    GroupUser
    |> where([gu], gu.group_id == ^message.group_id)
    |> where([gu], gu.user_id != ^message.user_id)
    |> update([gu], set: [unread_messages_count: fragment("greatest(? - 1, 0)", gu.unread_messages_count)])
  end

  def mention_users(%Group{name: name, id: group_id}, _mentioned_user_ids, user_ids) when name in ["__dm_group__", "__multi_dm_group__"] do
    GroupUser
    |> where([gu], gu.group_id == ^group_id)
    |> where([gu], gu.user_id in ^user_ids)
    |> update([gu], inc: [mentions_count: ^1])
  end

  def mention_users(%Group{id: group_id}, mentioned_user_ids, _user_ids) do
    GroupUser
    |> where([gu], gu.group_id == ^group_id)
    |> where([gu], gu.user_id in ^mentioned_user_ids)
    |> update([gu], inc: [mentions_count: ^1])
  end

  def unmention_users(message) do
    GroupUser
    |> where([gu], gu.group_id == ^message.group_id)
    |> where([gu], gu.user_id in ^message.mentioned_user_ids)
    |> update([gu], set: [mentions_count: fragment("greatest(? - 1, 0)", gu.mentions_count)])
  end

  def pin(message, user) do
    message
    |> pin_changeset(%{pinned: true, pinned_by_id: user.id, pinned_at: DateTime.utc_now})
    |> Repo.update
  end

  def unpin(message) do
    message
    |> pin_changeset(%{pinned: false, pinned_by_id: nil, pinned_at: nil})
    |> Repo.update
  end

  def mark_as_unread(user_id, group_id, %Message{type: "system"} = message) do
    message = get_message_to_unread(message)
    mark_as_unread(user_id, group_id, message)
  end

  def mark_as_unread(user_id, group_id, nil) do
    group_user = Repo.get_by(GroupUser, user_id: user_id, group_id: group_id)
    {:ok, %{mark_messages_as_unread: {0, []}, mark_group_as_unread: {1, [group_user]}}}
  end

  def mark_as_unread(user_id, group_id, message) do
    Multi.new
    |> Multi.update_all(:mark_messages_as_read, mark_messages_as_read(group_id, user_id, message.id), [])
    |> Multi.update_all(:mark_messages_as_unread, mark_messages_as_unread(group_id, user_id, message.id), [], [returning: true])
    |> Multi.update_all(:mark_group_as_unread, mark_group_as_unread(group_id, user_id, message), [], [returning: true])
    |> Repo.transaction
  end

  def get_message_to_unread(%Message{} = message) do
    Message
    |> where([m], m.id < ^message.id)
    |> where([m], m.type != "system")
    |> where([m], m.group_id == ^message.group_id)
    |> order_by([m], [desc: m.id])
    |> limit(1)
    |> Repo.one
  end

  defp mark_messages_as_unread(group_id, user_id, message_id) do
    Message
    |> where([m], m.group_id == ^group_id)
    |> where([m], m.id >= ^message_id)
    |> where([m], m.user_id != ^user_id)
    |> where([m], fragment("(? \\? ?) and (not (? @> ?))",
      m.read_status, ^to_string(user_id), m.read_status, ^%{to_string(user_id) => nil}))
    |> update([m], set: [read_status: fragment("? || ?", m.read_status, ^%{user_id => nil})])
  end

  defp mark_group_as_unread(group_id, user_id, message) do
    %{mentions_count: mentions_count, unread_messages_count: unread_messages_count} = count_after(group_id, user_id, message.id)

    GroupUser
    |> where(group_id: ^group_id, user_id: ^user_id)
    |> update([m], set: [
      last_read_at: ^message.inserted_at,
      mentions_count: ^mentions_count,
      unread_messages_count: ^unread_messages_count,
    ])
  end

  defp count_after(group_id, user_id, message_id) do
    Message
    |> where([m], m.group_id == ^group_id)
    |> where([m], m.id >= ^message_id)
    |> where([m], m.type != "system")
    |> select([m], %{
      mentions_count: fragment("coalesce(count (*) filter (where ? @> ?), 0)", m.mentioned_user_ids, ^[user_id]),
      unread_messages_count: count(m.id),
    })
    |> Repo.one
  end

  def mark_as_read(user_id, group_id) do
    if GroupQueries.user_is_member?(group_id, user_id) do
      Multi.new
      |> Multi.update_all(:mark_messages_as_read, mark_messages_as_read(group_id, user_id), [], [returning: true])
      |> Multi.update_all(:mark_group_as_read, mark_group_as_read(group_id, user_id), [], [returning: true])
      |> Repo.transaction
    else
      {:error, "User is not part of this room"}
    end
  end

  defp mark_messages_as_read(group_id, user_id) do
    group_user = Repo.get_by(GroupUser, group_id: group_id, user_id: user_id)
    last_read_at = group_user.last_read_at || group_user.inserted_at

    Message
    |> where([m], m.group_id == ^group_id)
    |> where([m], m.inserted_at >= ^last_read_at)
    |> where([m], fragment("? @> ?", m.read_status, ^%{to_string(user_id) => nil}))
    |> update([m], set: [read_status: fragment("? || ?", m.read_status, ^%{user_id => NaiveDateTime.utc_now})])
  end

  defp mark_messages_as_read(group_id, user_id, message_id) do
    mark_messages_as_read(group_id, user_id)
    |> where([m], m.id < ^message_id)
  end

  defp mark_group_as_read(group_id, user_id) do
    GroupUser
    |> where(group_id: ^group_id, user_id: ^user_id)
    |> update([m], set: [last_read_at: ^DateTime.utc_now, mentions_count: 0, unread_messages_count: 0])
  end

  def join_message_changeset(%Group{} = group, %User{} = user) do
    system_changeset(%Message{user_id: user.id, group_id: group.id}, %{
      type: "system",
      text_content: "{user} joined the room at {time}",
      fields: %{
        type: "join_group",
        user: %{
          id: user.id,
          name: "#{user.first_name} #{user.last_name}"
        },
        time: NaiveDateTime.utc_now,
      }
    })
  end
  def join_message_changeset(%Group{} = group, user_id) do
    join_message_changeset(group, Repo.get(User, user_id))
  end

  def leave_message_changeset(%Group{} = group, %User{} = user) do
    system_changeset(%Message{user_id: user.id, group_id: group.id}, %{
      type: "system",
      text_content: "{user} left the room at {time}",
      fields: %{
        type: "leave_group",
        user: %{
          id: user.id,
          name: "#{user.first_name} #{user.last_name}"
        },
        time: NaiveDateTime.utc_now,
      }
    })
  end
  def leave_message_changeset(%Group{} = group, user_id) do
    leave_message_changeset(group, Repo.get(User, user_id))
  end
end
