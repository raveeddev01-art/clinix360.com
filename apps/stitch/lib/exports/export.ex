defmodule Stitch.Exports.Export do
  @moduledoc """
  Represents an export belonging to a Team.
  """
  use Ecto.Schema
  import Ecto.Changeset

  schema "exports" do
    field :status, :string, default: "PROCESSING"
    field :zip_url, :string
    belongs_to :team, Stitch.Team
    timestamps()
  end

  @doc false
  def new(params \\ %{}) do
    fields = ~w(team_id)a

    %__MODULE__{}
    |> cast(params, fields)
    |> validate_required(fields)
  end

  @doc false
  def update(struct, params \\ %{}) do
    cast(struct, params, ~w(status zip_url)a)
  end
end
