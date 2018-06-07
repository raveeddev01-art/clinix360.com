defmodule Stitch.TeamPatient do
  @moduledoc """
  The association between Teams and Patients.
  """

  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.{Repo, TeamPatient, Patient, Team}

  @type t :: %__MODULE__{}

  @cs_attributes [:mrn, :metadata, :active, :team_id, :patient_id]
  @required_attributes [:mrn, :metadata, :active, :team_id, :patient_id]

  schema "team_patients" do
    belongs_to(:team, Team)
    belongs_to(:patient, Patient)

    field(:mrn, :string)
    field(:active, :boolean, default: false)
    field(:metadata, :map, default: %{})

    timestamps()
  end

  def changeset(%Stitch.TeamPatient{} = struct, params) do
    struct
    |> cast(params, @cs_attributes)
    |> validate_required(@required_attributes)
    |> unique_constraint(:mrn, name: :team_patients_mrn_team_id_index)
    |> unique_constraint(:patient_id, name: :team_patients_patient_id_team_id_index)
  end

  @doc """
  TODO: MAKE ME
  """
  @spec create(map) :: {:ok, TeamPatient.t()} | {:error, Ecto.Changeset.t()}
  def create(params) do
    patient = %TeamPatient{}
    changeset = changeset(patient, params)
    Repo.insert(changeset)
  end
end
