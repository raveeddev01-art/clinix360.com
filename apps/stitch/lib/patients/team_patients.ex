defmodule Stitch.TeamPatients do
  @moduledoc """
  The association between Teams and Patients.
  """

  use Ecto.Schema
  import Ecto.Changeset

  schema "team_patients" do
    belongs_to(:team, Stitch.Patient)
    belongs_to(:patient, Stitch.Team)

    field(:mrn, :string)
    field(:active, :boolean, default: false)
    field(:metadata, :map, default: %{})
  end
end
