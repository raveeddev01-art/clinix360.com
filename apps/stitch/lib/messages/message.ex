defmodule Stitch.Message do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Ecto.Multi

  alias Stitch.{
    Accounts.User,
    Audit,
    Files.Upload,
    # Files.UploadComment,
    Group,
    GroupQueries,
    GroupUser,
    Message,
    Message.LinkPreview,
    Message.Mention,
    Message.MessageCreation,
    ReadStatus,
    Repo,
    Call
  }

  @valid_types [
    "chat",
    "call",
    "system",
    "upload",
    "file_share",
    "file_comment",
    "meet_link",
    "internal_link"
  ]

  schema "messages" do
    belongs_to(:user, User)
    belongs_to(:group, Group)
    belongs_to(:pinned_by, User, foreign_key: :pinned_by_id)
    field(:request_id, :string)
    field(:deleted, :boolean, default: false)
    field(:edited_at, :utc_datetime)
    field(:text_content, :string)
    field(:type, :string)
    field(:fields, {:array, :map})
    field(:pinned, :boolean)
    field(:pinned_at, :utc_datetime)
    field(:read_status, :map, default: %{})
    field(:mentioned_user_ids, {:array, :integer}, default: [])
    field(:has_links, :boolean, default: false)
    field(:link_previews_generated, :boolean, default: false)
    field(:meteor_id, :string)
    field(:client_device_type, :string, default: "unknown")
    field(:client_os, :string, default: "unknown")
    field(:client_name, :string, default: "unknown")
    field(:slack_import_id, :string)
    field(:highlighted_text_content, :string, virtual: true)
    field(:reactions, :map, default: %{})
    field(:upload_ids, {:array, :integer}, default: [])
    field(:notify_user_ids, {:array, :integer}, default: [])
    # Remove on the next release
    field(:requires_fallback_comment, :boolean, default: true)

    belongs_to(:call, Call)
    belongs_to(:upload, Upload)
    # has_many(:uploads, Upload)
    # belongs_to(:upload_comment, UploadComment)
    belongs_to(:parent_message, Message)
    has_many(:thread_messages, Message, foreign_key: :parent_message_id)

    embeds_many(:link_previews, LinkPreview, on_replace: :delete)

    timestamps()
  end

  @upload_castable_attributes [
    :fields,
    :type,
    :text_content,
    :request_id,
    :mentioned_user_ids,
    :read_status,
    :client_device_type,
    :client_os,
    :client_name,
    :requires_fallback_comment,
    :upload_ids
  ]

  def changeset(%Message{} = struct, params) do
    struct
    |> cast(params, [
      :user_id,
      :group_id,
      :deleted,
      :text_content,
      :fields,
      :type,
      :pinned,
      :pinned_by_id,
      :pinned_at,
      :mentioned_user_ids,
      :client_device_type,
      :client_os,
      :client_name
    ])
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
    |> LinkPreview.check_for_links()
    |> put_change(:edited_at, DateTime.utc_now())
  end

  def chat_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, [
      :type,
      :fields,
      :request_id,
      :text_content,
      :mentioned_user_ids,
      :read_status,
      :client_device_type,
      :client_os,
      :client_name
    ])
    |> validate_required([:type, :text_content])
    |> validate_inclusion(:type, ["chat"])
    |> LinkPreview.check_for_links()
  end

  def meet_link_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, [
      :type,
      :request_id,
      :text_content,
      :mentioned_user_ids,
      :read_status,
      :client_device_type,
      :client_os,
      :client_name
    ])
    |> validate_required([:type, :text_content])
    |> validate_inclusion(:type, ["meet_link"])
  end

  def internal_link_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, [
      :type,
      :request_id,
      :text_content,
      :mentioned_user_ids,
      :read_status,
      :client_device_type,
      :client_os,
      :client_name,
      :fields
    ])
    |> validate_required([:type, :text_content])
    |> validate_inclusion(:type, ["internal_link"])
  end

  def notify_user_ids_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, [:notify_user_ids])
    |> validate_required([:notify_user_ids])
  end

  def upload_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, @upload_castable_attributes)
    |> put_change(:requires_fallback_comment, false)
    |> validate_required([:fields, :type])
    |> validate_inclusion(:type, ["file_share", "upload"])
  end

  def file_comment_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, @upload_castable_attributes)
    |> validate_required([:fields, :type, :text_content])
    |> validate_inclusion(:type, ["file_comment"])
  end

  def system_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, [:fields, :type, :text_content])
    |> validate_required([:fields, :type])
    |> validate_inclusion(:type, ["system"])
  end

  def call_changeset(%Message{} = struct, params \\ %{}) do
    struct
    |> cast(params, [:fields, :type, :text_content])
    |> validate_required([:fields, :type])
    |> validate_inclusion(:type, ["call"])
  end

  @spec create(Group.t() | pos_integer, User.t(), map, map | nil) ::
          {:ok, map} | {:error, atom, Ecto.Changeset.t(), any}
  def create(group, user, attrs, presence_user_ids \\ %{active: [], online: []})

  def create(%Group{} = group, user, %{"type" => "meet_link"} = attrs, presence_user_ids) do
    MessageCreation.create(group, user, attrs, presence_user_ids)
  end

  def create(%Group{} = group, user, %{"type" => "internal_link"} = attrs, presence_user_ids) do
    attrs =
      decode_message_link_ids_to_fields(attrs["text_content"])
      |> Map.merge(attrs)

    MessageCreation.create(group, user, attrs, presence_user_ids)
  end

  def create(%Message{} = message, user, %{"type" => "internal_link"} = attrs, presence_user_ids) do
    attrs =
      decode_message_link_ids_to_fields(attrs["text_content"])
      |> Map.merge(attrs)

    MessageCreation.create(message, user, attrs, presence_user_ids)
  end

  def create(%Group{} = group, user, attrs, presence_user_ids) do
    attrs = Map.put_new(attrs, "type", "chat")
    MessageCreation.create(group, user, attrs, presence_user_ids)
  end

  def create(%Message{} = message, user, attrs, presence_user_ids) do
    attrs = Map.put_new(attrs, "type", "chat")
    MessageCreation.create(message, user, attrs, presence_user_ids)
  end

  def create(group_id, user, attrs, presence_user_ids) do
    group = GroupQueries.get_by_id(group_id)
    attrs = Map.put_new(attrs, "type", "chat")
    MessageCreation.create(group, user, attrs, presence_user_ids)
  end

  def message_changeset(message, %{"type" => "chat"} = attrs) do
    message |> chat_changeset(attrs)
  end

  def message_changeset(message, %{"type" => "meet_link"} = attrs) do
    message |> meet_link_changeset(attrs)
  end

  def message_changeset(message, %{"type" => "internal_link"} = attrs) do
    message |> internal_link_changeset(attrs)
  end

  def message_changeset(message, %{"type" => "call"} = attrs) do
    message |> call_changeset(attrs)
  end

  def message_changeset(message, %{"type" => "upload"} = attrs) do
    message |> upload_changeset(attrs)
  end

  def message_changeset(message, %{"type" => "file_share"} = attrs) do
    message |> upload_changeset(attrs)
  end

  def message_changeset(message, %{"type" => "file_comment"} = attrs) do
    message |> file_comment_changeset(attrs)
  end

  def update_uploads(upload, %Message{} = struct) do
    struct
    |> changeset(upload)
    |> cast_assoc(:upload)
    |> Repo.update()
  end

  def update_fields(fields, %Message{} = struct) do
    upload_ids = Enum.map(fields, & &1["id"])
    attrs = %{upload_ids: upload_ids, fields: fields}
    struct |> upload_changeset(attrs) |> Repo.update()
  end

  def update(message, attributes) do
    group = GroupQueries.get_by_id(message.group_id)
    group = Repo.preload(group, :users)
    author = Repo.preload(message, :user).user
    text_content = attributes["text_content"] || ""

    mentioned_user_ids = Mention.get_mentioned_user_ids(author, text_content, [], group)

    message
    |> user_edit_changeset(%{
      text_content: attributes["text_content"],
      mentioned_user_ids: mentioned_user_ids
    })
    |> Repo.update()
    |> Audit.Message.track_update(author, message)
  end

  def delete(message, user) do
    Multi.new()
    |> Multi.update_all(:unmention_users, unmention_users(message), [])
    |> Multi.update_all(
      :decrement_unread_counter,
      ReadStatus.decrement_unread_counter(message),
      []
    )
    |> Multi.delete(:message, message)
    |> Repo.transaction()
    |> Audit.Message.track_delete(user)
  end

  def mention_users(%Group{name: name, id: group_id}, _mentioned_user_ids, user_ids)
      when name in ["__dm_group__", "__multi_dm_group__"] do
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
    |> pin_changeset(%{pinned: true, pinned_by_id: user.id, pinned_at: DateTime.utc_now()})
    |> Repo.update()
  end

  def unpin(message) do
    message
    |> pin_changeset(%{pinned: false, pinned_by_id: nil, pinned_at: nil})
    |> Repo.update()
  end

  def join_message_changeset(%Group{} = group, %User{} = user) do
    system_changeset(%Message{user_id: user.id, group_id: group.id}, %{
      type: "system",
      text_content: "{user} joined the room at {time}",
      fields: [
        %{
          type: "join_group",
          user: %{
            id: user.id,
            name: "#{user.first_name} #{user.last_name}"
          },
          time: NaiveDateTime.utc_now()
        }
      ]
    })
  end

  def join_message_changeset(%Group{} = group, user_id) do
    join_message_changeset(group, Repo.get(User, user_id))
  end

  def leave_message_changeset(%Group{} = group, %User{} = user) do
    system_changeset(%Message{user_id: user.id, group_id: group.id}, %{
      type: "system",
      text_content: "{user} left the room at {time}",
      fields: [
        %{
          type: "leave_group",
          user: %{
            id: user.id,
            name: "#{user.first_name} #{user.last_name}"
          },
          time: NaiveDateTime.utc_now()
        }
      ]
    })
  end

  def leave_message_changeset(%Group{} = group, user_id) do
    leave_message_changeset(group, Repo.get(User, user_id))
  end

  @spec update_shared_uploads(Upload.t()) :: {integer(), nil | list}
  def update_shared_uploads(%Upload{} = upload) do
    Message
    |> where(upload_id: ^upload.id)
    |> Repo.update_all(set: [fields: Upload.fields(upload)])
  end

  def encode_url_id(message_id) do
    "m" <> Base.encode64("#{message_id}", case: :upper, padding: true)
  end

  def decode_message_link_ids_to_fields(url) do
    decoded_ids =
      Regex.split(~r{-m}, url)
      |> Enum.take(-3)
      |> Enum.map(fn id -> decode_url_id(id) end)

    %{
      "fields" => [
        %{
          "ref_message_id" => decoded_ids |> Enum.at(1),
          "ref_group_id" => decoded_ids |> Enum.at(0),
          "parent_message_id" => decoded_ids |> Enum.at(2)
        }
      ]
    }
  end

  def decode_url_id(encoded_id) do
    with {:ok, string_id} <- Base.decode64("#{encoded_id}", case: :upper, padding: true),
         {int_id, _} <- Integer.parse(string_id) do
      int_id
    else
      _ -> :error
    end
  end
end
