defmodule Stitch.IntegrationConfig do
  @moduledoc """
  The integration config schema module.
  """

  use Ecto.Schema
  import Ecto.{Query, Changeset}
  alias Stitch.{Integration, IntegrationConfig, Group}
  alias Stitch.Repo

  @type t :: %__MODULE__{}

  schema "integration_configs" do
    belongs_to(:integration, Integration)
    belongs_to(:group, Group)
    field(:settings, :map)

    timestamps()
  end

  def changeset(struct, attrs) do
    struct
    |> cast(attrs, [:integration_id, :group_id, :settings])
    |> validate_required([:integration_id, :group_id, :settings])
  end

  def insert_integration_config(attrs) do
    %IntegrationConfig{}
    |> changeset(attrs)
    |> Repo.insert()
  end

  def all_for_team(team_id) do
    query =
      from(
        c in IntegrationConfig,
        left_join: i in assoc(c, :integration),
        where: i.team_id == ^team_id,
        order_by: [asc: c.inserted_at],
        preload: [:integration, :group],
        select: c
      )

    query
    |> Repo.all()
  end

  def get_by_id(id) do
    query =
      from(
        c in IntegrationConfig,
        where: c.id == ^id,
        select: c
      )

    Repo.one(query)
  end

  def delete(config) do
    Repo.delete(config)
  end
end
