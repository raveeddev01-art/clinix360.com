defmodule Stitch.Integration do
  @moduledoc """
  The integration schema module.
  """

  use Ecto.Schema
  import Ecto.{Query, Changeset}
  alias Stitch.{Team}
  alias Stitch.Repo

  @type t :: %__MODULE__{}

  schema "integrations" do
    belongs_to(:team, Team)
    field(:name, :string)
    field(:settings, :map)
    field(:enabled, :boolean, default: false)

    timestamps()

    has_many(:integration_configs, Stitch.IntegrationConfig, on_delete: :delete_all)
  end

  def changeset(struct, attrs) do
    struct
    |> cast(attrs, [:team_id, :name, :settings, :enabled])
    |> validate_required([:team_id, :name, :settings])
  end
end
