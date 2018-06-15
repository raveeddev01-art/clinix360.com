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

  alias Stitch.{
    Repo,
    TeamPatient,
    Accounts.User,
    Engage.Conversation,
    Engage.ConversationMessage
  }

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
    :read_status,
    :has_links,
    :link_previews_generated,
    :client_device_type,
    :client_os,
    :client_name,
    :highlighted_text_content
  ]

  @required_attributes [:text_content]

  schema "conversation_messages" do
    belongs_to(:conversation, Conversation)
    # In lieu of polymorphism, each row has either a patient_id or a provider_id.
    # See link for polymorphic options in phoenix (this is option 1)
    # https://hexdocs.pm/ecto/Ecto.Schema.html#belongs_to/3-polymorphic-associations
    belongs_to(:team_patient, TeamPatient)
    belongs_to(:provider, User)

    field(:text_content, :string)

    field(:request_id, :string)
    field(:edited_at, :utc_datetime)
    field(:deleted, :boolean, default: false)
    field(:type, :string, default: "chat")
    field(:fields, :map, default: %{})
    field(:read_status, :map, default: %{})
    field(:has_links, :boolean, default: false)
    field(:link_previews_generated, :boolean, default: false)
    field(:client_device_type, :string, default: "unknown")
    field(:client_os, :string, default: "unknown")
    field(:client_name, :string, default: "unknown")
    # TODO: Add link preview logic
    # embeds_many(:link_previews, Message.LinkPreview, on_replace: :delete)

    timestamps()
  end

  # TODO: Do not cast all attributes.
  # This is temporarily the case as we develop engage.
  def changeset(%ConversationMessage{} = struct, params) do
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
end
