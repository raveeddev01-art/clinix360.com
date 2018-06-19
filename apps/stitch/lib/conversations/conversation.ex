defmodule Stitch.Engage.Conversation do
  @moduledoc """
  The Conversation schema module.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias Stitch.Repo

  alias Stitch.Engage.{
    Inbox,
    Conversation,
    ConversationProvider,
    ConversationPatient,
    ConversationMessage
  }

  @type t :: %__MODULE__{}

  @castable_attributes [:slug, :open]
  @required_attributes [:slug]

  schema "conversations" do
    belongs_to(:inbox, Inbox)

    has_many(:conversation_providers, ConversationProvider, on_delete: :delete_all)
    has_many(:providers, through: [:conversation_providers, :provider])

    has_many(:conversation_patients, ConversationPatient, on_delete: :delete_all)
    has_many(:team_patients, through: [:conversation_patients, :team_patient])

    has_many(:conversation_messages, ConversationMessage, on_delete: :delete_all)

    field(:slug, :string)
    field(:open, :boolean, default: true)

    timestamps()
  end

  def changeset(%Conversation{} = struct, params) do
    struct
    |> cast(params, @castable_attributes)
    |> validate_required(@required_attributes)
    |> unique_constraint(
      :slug,
      name: :conversations_inbox_id_slug_index,
      message: "has already been taken"
    )
  end

  def create_for_inbox(inbox_id, params) do
    %Conversation{inbox_id: inbox_id}
    |> changeset(params)
    |> Repo.insert()
  end
end
