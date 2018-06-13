defmodule Stitch.TeamPatient do
  @moduledoc """
  The association between Teams and Patients.
  """

  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.{Repo, TeamPatient, Patient, Team, PatientQueries}

  @type t :: %__MODULE__{}

  @cs_attributes [:mrn, :metadata, :active]
  @required_attributes [:mrn, :metadata, :active]

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
  Helper function to add a team patient given a map of attributes
  """
  @spec create(map) :: {:ok, TeamPatient.t()} | {:error, Ecto.Changeset.t()}
  def create(params) do
    changeset =
      changeset(%TeamPatient{patient_id: params.patient_id, team_id: params.team_id}, params)

    Repo.insert(changeset)
  end

  @doc """
  Helper function to add a team patient given a map of attributes
  """
  @spec create_as_provider(Team.t(), map) :: {:ok, map} | {:error, map}
  def create_as_provider(team, params) do
    Ecto.Multi.new()
    |> Ecto.Multi.run(:patient, fn _ ->
      find_or_create_patient_as_provider(params)
    end)
    |> Ecto.Multi.run(:team_patient, fn %{patient: patient} ->
      changeset =
        changeset(
          %TeamPatient{patient_id: patient.id, team_id: team.id},
          params
        )

      Repo.insert(changeset)
    end)
    |> Repo.transaction()
  end

  @doc """
  Helper function to add a team patient given a map of attributes
  """
  @spec update_as_provider(TeamPatient.t(), map) :: {:ok, map} | {:error, map}
  def update_as_provider(team_patient, params) do
    Ecto.Multi.new()
    |> Ecto.Multi.run(:patient, fn _ ->
      Patient.update_as_provider(team_patient.patient, params)
    end)
    |> Ecto.Multi.run(:team_patient, fn _ ->
      changeset = changeset(team_patient, params)
      Repo.update(changeset)
    end)
    |> Repo.transaction()
  end

  defp find_or_create_patient_as_provider(params) do
    case PatientQueries.find_patient_by_email(params["email"]) do
      nil -> Patient.create_as_provider(params)
      patient -> {:ok, patient}
    end
  end
end
