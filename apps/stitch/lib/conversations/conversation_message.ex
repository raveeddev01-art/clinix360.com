defmodule Stitch.Engage.ConversationMessage do
  @moduledoc """
  The schema for conversation messages.

  Conversation messages are the messages between providers
  and patients in an engage conversatiom. Unlike "Stitch.Message"
  they do NOT live in Connect, though they share much of the same
  functionality.
  """

  use Ecto.Schema

  alias Stitch.{
    TeamPatient,
    Accounts.User,
    Engage.Conversation
  }

  @type t :: %__MODULE__{}

  schema "conversation_patients" do
    belongs_to(:conversation, Conversation)
    # In lieu of polymorphism, each row has either a patient_id or a provider_id.
    # See link for polymorphic options in phoenix (this is option 1)
    # https://hexdocs.pm/ecto/Ecto.Schema.html#belongs_to/3-polymorphic-associations
    belongs_to(:team_patient, TeamPatient)
    belongs_to(:provider, User)

    field(:request_id, :string)
    field(:deleted, :boolean, default: false)
    field(:edited_at, :utc_datetime)
    field(:text_content, :string)
    field(:type, :string)
    field(:fields, :map)
    field(:read_status, :map, default: %{})
    field(:has_links, :boolean, default: false)
    field(:link_previews_generated, :boolean, default: false)
    field(:client_device_type, :string, default: "unknown")
    field(:client_os, :string, default: "unknown")
    field(:client_name, :string, default: "unknown")
    field(:highlighted_text_content, :string, virtual: true)
    embeds_many(:link_previews, Message.LinkPreview, on_replace: :delete)

    timestamps()
  end
end
