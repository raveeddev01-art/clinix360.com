defmodule Stitch.Integration do
  @moduledoc """
  The integration schema module.
  """

  use Ecto.Schema
  import Ecto.{Query, Changeset}
  alias Stitch.{Team, Integration}
  alias Stitch.Repo

  @type t :: %__MODULE__{}

  schema "integrations" do
    # REMOVE name
    field(:name, :string)
    field(:webhook_token, :string)
    field(:settings, :map)
    field(:credentials, :map)
    field(:enabled, :boolean, default: false)
    field(:authenticated, :boolean, default: false)

    belongs_to(:team, Team)
    belongs_to(:group, Stitch.Group)
    belongs_to(:app, Stitch.App)

    timestamps()
  end

  # Changeset used when creating a brand new integration for a group.
  def create_changeset(struct, attrs) do
    struct
    |> cast(attrs, [:app_id, :group_id, :team_id])
    |> validate_required([:app_id, :group_id, :team_id])
    |> put_change(:webhook_token, Stitch.Util.Security.websafe_string())
    |> put_change(:enabled, true)
  end

  # Changeset used when updating an existing integration.
  def update_changeset(struct, attrs) do
    struct
    |> cast(attrs, [:group_id, :settings, :authenticated, :enabled, :credentials])
    |> validate_required([:group_id])
  end

  # Deprecated. Do NOT use.
  def changeset(struct, attrs) do
    struct
    |> cast(attrs, [:team_id, :name, :webhook_token, :settings, :enabled])
    |> validate_required([:team_id, :name, :webhook_token, :settings])
  end

  @doc """
  Creates an integration for the app_id, given the group_id.
  """
  @spec create(number, number, number) :: Integration.t() | {:error, term}
  def create(app_id, group_id, team_id) do
    Stitch.DrChrono.Bot.init_or_enable_bot(team_id)

    %Integration{}
    |> create_changeset(%{app_id: app_id, group_id: group_id, team_id: team_id})
    |> Repo.insert()
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

  def delete(integration) do
    Repo.delete(integration)
  end

  def update(integration, params) do
    update_changeset(integration, params)
    |> Repo.update()
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
