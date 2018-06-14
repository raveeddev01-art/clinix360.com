defmodule Stitch.Engage.ConversationPatient do
  @moduledoc """
  The association between conversations and patients.

  Eventually, notification settings and archived values will
  live here.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias Stitch.{
    Repo,
    TeamPatient,
    Engage.Conversation,
    Engage.ConversationPatient
  }

  @castable_attributes [:last_read_at, :unread_messages_count]
  @required_attributes []

  @type t :: %__MODULE__{}

  schema "conversation_patients" do
    belongs_to(:conversation, Conversation)
    belongs_to(:team_patient, TeamPatient)

    field(:last_read_at, :naive_datetime)
    field(:unread_messages_count, :integer, default: 0)

    timestamps()
  end

  def changeset(%ConversationPatient{} = struct, params) do
    struct
    |> cast(params, @castable_attributes)
    |> validate_required(@required_attributes)
    |> unique_constraint(
      :team_patient_id,
      name: :conversation_patients_conversation_id_team_patient_id_index,
      message: "patient is already part of this conversation"
    )
  end

  def create_for_conversation_and_patient(conversation_id, team_patient_id, params \\ %{}) do
    %ConversationPatient{conversation_id: conversation_id, team_patient_id: team_patient_id}
    |> changeset(params)
    |> Repo.insert()
  end
end
