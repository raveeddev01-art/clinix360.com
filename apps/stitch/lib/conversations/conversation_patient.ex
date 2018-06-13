defmodule Stitch.Engage.ConversationPatient do
  @moduledoc """
  The association between conversations and patients.

  Eventually, notification settings and archived values will
  live here.
  """

  use Ecto.Schema

  alias Stitch.{
    TeamPatient,
    Engage.Conversation
  }

  @type t :: %__MODULE__{}

  schema "conversation_patients" do
    belongs_to(:conversation, Conversation)
    belongs_to(:team_patient, TeamPatient)

    field(:last_read_at, :naive_datetime)
    field(:unread_messages_count, :integer, default: 0)

    timestamps()
  end
end
