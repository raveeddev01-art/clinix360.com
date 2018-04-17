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
    field(:webhook_token, :string)
    field(:settings, :map)
    field(:enabled, :boolean, default: false)
    field(:authenticated, :boolean, default: false)
    field(:credentials, :map)

    timestamps()
  end

  def changeset(struct, attrs) do
    struct
    |> cast(attrs, [:team_id, :name, :webhook_token, :settings, :enabled])
    |> validate_required([:team_id, :name, :webhook_token, :settings])
  end

  def get_by_team_id(team_id) do
    query =
      from(
        i in Stitch.Integration,
        where: i.team_id == ^team_id,
        select: i
      )

    Repo.all(query)
  end

  def get_by_webhook_token(webhook_token) do
    query =
      from(
        i in Stitch.Integration,
        where: i.webhook_token == ^webhook_token,
        select: i
      )

    Repo.all(query)
  end

  def get_team_by_webhook_token(webhook_token) do
    query =
      from(
        i in Stitch.Integration,
        where: i.webhook_token == ^webhook_token,
        preload: [:team],
        select: i
      )

    integration = Repo.one(query)
    integration.team
  end

  def enable(integration) do
    integration
    |> changeset(%{enabled: true})
    |> Repo.update()
  end

  def disable(integration) do
    integration
    |> changeset(%{enabled: false})
    |> Repo.update()
  end
end
