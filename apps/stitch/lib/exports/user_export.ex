defmodule Stitch.Exports.UserExport do
  @moduledoc """
  Represents an export belonging to a User.
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias Stitch.{
    Accounts.User,
    Exports.UserExport,
    Team,
    Repo
  }

  @type t :: %__MODULE__{}

  @changeable_attributes [
    :status,
    :zip_url
  ]

  @required_attributes [
    :status
  ]

  schema "user_exports" do
    field(:status, :string, default: "PROCESSING")
    field(:zip_url, :string)
    belongs_to(:team, Team)
    belongs_to(:user, User)
    timestamps()
  end

  @spec changeset(UserExport.t(), map) :: Ecto.Changeset.t()
  def changeset(%UserExport{} = user_export, attrs) do
    user_export
    |> cast(attrs, @changeable_attributes)
    |> validate_required(@required_attributes)
    |> validate_inclusion(:status, ["PROCESSING", "FAILED", "COMPLETE"])
  end

  @spec new(Team.t(), User.t(), map) :: Ecto.Changeset.t()
  def new(%Team{} = team, %User{} = user, attrs) do
    %UserExport{team: team, user: user}
    |> changeset(attrs)
  end

  @spec create(Team.t(), User.t(), map) :: {:ok, map} | {:error, Ecto.Changeset.t()}
  def create(%Team{} = team, %User{} = user, attrs) do
    new(team, user, attrs)
    |> Repo.insert()
  end

  @spec update(UserExport.t(), map) :: {:ok, UserExport.t()} | {:error, Ecto.Changeset.t()}
  def update(%UserExport{} = export_user, attrs) do
    export_user
    |> changeset(attrs)
    |> Repo.update()
  end
end
