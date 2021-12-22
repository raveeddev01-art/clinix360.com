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
    Accounts.User,
    Audit,
    Engage.Conversation,
    Engage.ConversationMessage,
    Files.EngageUpload,
    Patient,
    ReadStatus,
    Repo
  }

  alias Stitch.Message.LinkPreview

  @type t :: %__MODULE__{}

  # User to set anything via helper methods
  # TODO: remove once dev is done
  @all_attributes [
    :conversation_id,
    :deleted,
    :edited_at,
    :text_content,
    :type,
    :fields,
    :request_id,
    :provider_read_status,
    :patient_read_status,
    :has_links,
    :link_previews_generated,
    # :client_device_type,
    :client_os,
    :client_name
  ]

  @required_attributes [:text_content]
  @required_upload_attributes [:type, :fields, :engage_upload_id]

  @page_length 50

  schema "conversation_messages" do
    belongs_to(:conversation, Conversation)
    # In lieu of polymorphism, each row has either a patient_id or a provider_id.
    # See link for polymorphic options in phoenix (this is option 1)
    # https://hexdocs.pm/ecto/Ecto.Schema.html#belongs_to/3-polymorphic-associations
    belongs_to(:patient, Patient)
    belongs_to(:provider, User)
    belongs_to(:engage_upload, EngageUpload)

    field(:text_content, :string)

    field(:request_id, :string)
    field(:edited_at, :utc_datetime)
    field(:deleted, :boolean, default: false)
    field(:type, :string, default: "chat")
    field(:fields, :map, default: %{})
    field(:provider_read_status, :map, default: %{})
    field(:patient_read_status, :map, default: %{})
    field(:has_links, :boolean, default: false)
    field(:link_previews_generated, :boolean, default: false)
    field(:client_device_type, :string, default: "unknown")
    field(:client_os, :string, default: "unknown")
    field(:client_name, :string, default: "unknown")
    field(:highlighted_text_content, :string, virtual: true)
    embeds_many(:link_previews, LinkPreview, on_replace: :delete)

    timestamps()
  end

  def page_length, do: @page_length

  # TODO: Do not cast all attributes.
  # This is temporarily the case as we develop engage.

  def changeset(%ConversationMessage{} = struct, %{"type" => type} = params)
      when type == "upload" do
    struct
    |> cast(params, @all_attributes ++ [:engage_upload_id])
    |> validate_required(@required_upload_attributes)
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
  end

  def create_for_patient(conversation_id, patient_id, params) do
    %ConversationMessage{conversation_id: conversation_id, patient_id: patient_id}
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
    |> Multi.update_all(
      :decrement_provider_unread_counters,
      ReadStatus.decrement_unread_counter(conversation_message, :provider),
      []
    )
    |> Multi.update_all(
      :decrement_patient_unread_counters,
      ReadStatus.decrement_unread_counter(conversation_message, :patient),
      []
    )
    |> Multi.delete(:conversation_message, conversation_message)
    |> Repo.transaction()
    |> Audit.ConversationMessage.track_delete(user)
  end

  def get_author(conversation_message) do
    conversation_message.patient || conversation_message.provider
  end
end
