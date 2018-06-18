defmodule Stitch.Engage.Inbox do
  @moduledoc """
  The Inbox schema module.
  """

  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.{Repo, Team}
  alias Stitch.Engage.{Inbox, InboxProvider, Conversation}

  @type t :: %__MODULE__{}

  @castable_attributes [:name]
  @required_attributes [:name, :is_default]

  schema "inboxes" do
    belongs_to(:team, Team)
    has_many(:inbox_providers, InboxProvider)
    has_many(:providers, through: [:inbox_providers, :provider])

    has_many(:conversations, Conversation)

    field(:name, :string)
    field(:is_default, :boolean, default: false)

    # manually loaded subset of conversations relationship
    has_many(:open_conversations, Conversation)
    # virtual attributes
    field(:open_conversations_count, :integer, virtual: true)
    field(:closed_conversations_count, :integer, virtual: true)

    timestamps()
  end

  def changeset(%Inbox{} = struct, params) do
    struct
    |> cast(params, @castable_attributes)
    |> validate_required(@required_attributes)
    |> unique_constraint(
      :name,
      name: :name_team_id_index,
      message: "has already been taken"
    )
    |> unique_constraint(
      :is_default,
      name: :default_inbox_team_id_index,
      message: "you already have a default inbox"
    )
  end

  @doc """
  Updates the inbox.
  """
  @spec update(t(), map) :: {:ok, t()} | {:error, Changeset.t()}
  def update(inbox, params) do
    inbox
    |> changeset(params)
    |> Repo.update()
  end

  # Helper function for development.
  # TODO: Remove once inboxes are created by default
  def create_for_team(team_id, params \\ %{is_default: true, name: "General"}) do
    %Inbox{team_id: team_id, is_default: true}
    |> changeset(params)
    |> Repo.insert()
  end
end
