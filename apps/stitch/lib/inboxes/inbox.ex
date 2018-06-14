defmodule Stitch.Engage.Inbox do
  @moduledoc """
  The Inbox schema module.
  """

  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.{Repo, Team}
  alias Stitch.Engage.{InboxProvider}

  @type t :: %__MODULE__{}

  @required_attributes [:name, :is_default]

  schema "inboxes" do
    belongs_to(:team, Team)
    has_many(:inbox_providers, InboxProvider)
    has_many(:providers, through: [:inbox_providers, :provider])

    field(:name, :string)
    field(:is_default, :boolean, default: false)

    timestamps()
  end

  def changeset(%Stitch.Engage.Inbox{} = struct, params) do
    struct
    |> cast(params, @required_attributes)
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

  # Helper function for development.
  # TODO: Remove once inboxes are created by default
  def create_for_team(team_id, params \\ %{is_default: true, name: "General"}) do
    %Stitch.Engage.Inbox{team_id: team_id}
    |> changeset(params)
    |> Repo.insert()
  end
end
