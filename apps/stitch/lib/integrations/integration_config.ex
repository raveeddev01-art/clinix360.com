defmodule Stitch.IntegrationConfig do
  @moduledoc """
  The integration config schema module.
  """

  use Ecto.Schema
  import Ecto.Query
  import Ecto.Changeset
  alias Stitch.{Integration, Group}
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
end
