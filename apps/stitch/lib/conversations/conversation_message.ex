defmodule Stitch.Engage.ConversationMessage do
  @moduledoc """
  The schema for conversation messages.

  Conversation messages are the messages between providers
  and patients in an engage conversatiom. Unlike "Stitch.Message"
  they do NOT live in Connect, though they share much of the same
  functionality.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias Ecto.Multi

  alias Stitch.{
    Repo,
    ReadStatus,
    TeamPatient,
    Accounts.User,
    Engage.Conversation,
    Engage.ConversationMessage,
    Audit
  }

  alias Stitch.Message.LinkPreview

  @type t :: %__MODULE__{}

  # User to set anything via helper methods
  # TODO: remove once dev is done
  @all_attributes [
    :conversation_id,
    :team_patient_id,
    :provider_id,
    :deleted,
    :edited_at,
    :text_content,
    :type,
    :fields,
    :request_id,
    # commenting out as this column is changing
    # in another PS and unused for now
    # :read_status,
    :has_links,
    :link_previews_generated,
    :client_device_type,
    :client_os,
    :client_name
  ]

  @required_attributes [:text_content]

  @page_length 50

  schema "conversation_messages" do
    belongs_to(:conversation, Conversation)
    # In lieu of polymorphism, each row has either a patient_id or a provider_id.
    # See link for polymorphic options in phoenix (this is option 1)
    # https://hexdocs.pm/ecto/Ecto.Schema.html#belongs_to/3-polymorphic-associations
    belongs_to(:team_patient, TeamPatient)
    belongs_to(:provider, User)
    belongs_to(:upload, Upload)

    field(:text_content, :string)

    field(:request_id, :string)
    field(:edited_at, :utc_datetime)
    field(:deleted, :boolean, default: false)
    field(:type, :string, default: "chat")
    field(:fields, :map, default: %{})
    # commenting out as this column is changing
    # in another PS and unused for now
    # field(:read_status, :map, default: %{})
    field(:has_links, :boolean, default: false)
    field(:link_previews_generated, :boolean, default: false)
    field(:client_device_type, :string, default: "unknown")
    field(:client_os, :string, default: "unknown")
    field(:client_name, :string, default: "unknown")
    embeds_many(:link_previews, LinkPreview, on_replace: :delete)

    timestamps()
  end

  def page_length, do: @page_length

  # TODO: Do not cast all attributes.
  # This is temporarily the case as we develop engage.

  def changeset(%ConversationMessage{type: type} = struct, params)
      when type == "file_share" or type == "upload" do
    struct
    |> base_changeset(params)
    |> validate_required([:fields, :type])
    |> validate_inclusion(:type, ["file_share"])
  end

  def changeset(%ConversationMessage{} = struct, params) do
    struct
    |> base_changeset(params)
    |> LinkPreview.check_for_links()
  end

  def edit_changeset(%ConversationMessage{} = struct, params \\ %{}) do
    struct
    |> base_changeset(params)
    |> LinkPreview.check_for_links()
    |> put_change(:edited_at, DateTime.utc_now())
  end

  defp base_changeset(%ConversationMessage{} = struct, params) do
    struct
    |> cast(params, @all_attributes)
    |> validate_required(@required_attributes)
    |> unique_constraint(
      :slug,
      name: :conversations_inbox_id_slug_index,
      message: "has already been taken"
    )
  end

  def create_for_patient(conversation_id, team_patient_id, params) do
    %ConversationMessage{conversation_id: conversation_id, team_patient_id: team_patient_id}
    |> changeset(params)
    |> Repo.insert()
  end

  def create_for_provider(conversation_id, provider_id, params) do
    %ConversationMessage{conversation_id: conversation_id, provider_id: provider_id}
    |> changeset(params)
    |> Repo.insert()
  end

  def update(conversation_message, attributes) do
    conversation_message
    |> edit_changeset(%{text_content: attributes["text_content"]})
    |> Repo.update()
    |> Audit.ConversationMessage.track_update(
      conversation_message.provider_id,
      conversation_message
    )
  end

  def delete(conversation_message, user) do
    Multi.new()
    # # TODO: uncomment when read status changes are merged
    # |> Multi.update_all(
    #   :decrement_unread_counter,
    #   # ReadStatus.decrement_unread_counter(conversation_message),
    #   []
    # )
    |> Multi.delete(:conversation_message, conversation_message)
    |> Repo.transaction()
    |> Audit.ConversationMessage.track_delete(user)
  end
end
