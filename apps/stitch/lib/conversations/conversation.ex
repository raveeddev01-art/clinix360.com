defmodule Stitch.Engage.Conversation do
  @moduledoc """
  The Conversation schema module.
  """

  use Ecto.Schema

  alias Stitch.Engage.{
    ConversationProvider,
    ConversationPatient,
    ConversationMessage
  }

  @type t :: %__MODULE__{}

  schema "conversations" do
    has_many(:conversation_providers, ConversationProvider, on_delete: :delete_all)
    has_many(:providers, through: [:conversation_providers, :provider])

    has_many(:conversation_patient, ConversationPatient, on_delete: :delete_all)
    has_many(:team_patients, through: [:conversation_patient, :team_patient])

    has_many(:conversation_messages, ConversationMessage, on_delete: :delete_all)

    field(:slug, :string)
    field(:open, :boolean, default: true)

    timestamps()
  end
end
