defmodule Stitch.Patient do
  @moduledoc """
  The Patient schema module.
  """

  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.{Repo, Patient, Team}

  @type t :: %__MODULE__{}

  @cs_attributes [
    :first_name,
    :last_name,
    :email,
    :phone_number,
    :onboarded,
    :mrn,
    :disabled
  ]

  @required_attributes [
    :first_name,
    :last_name,
    :email,
    :onboarded,
    :mrn
  ]

  schema "patients" do
    belongs_to(:team, Team)

    field(:first_name, :string)
    field(:last_name, :string)
    field(:email, :string)
    field(:phone_number, :string)
    field(:mrn, :string)

    field(:disabled, :boolean, default: false)
    field(:onboarded, :boolean, default: false)

    field(:profile_image_url, :string)
    field(:profile_image_thumb_url, :string)

    timestamps()
  end

  def changeset(%Stitch.Patient{} = struct, attrs) do
    struct
    |> cast(attrs, @cs_attributes)
    |> validate_required(@required_attributes)
    |> Stitch.Validators.valid_email_changeset(attrs)
    |> Stitch.Accounts.ProfileImage.default_profile_image_changeset(attrs)
    |> update_change(:email, &String.trim/1)
    |> unique_constraint(:email)
    |> Stitch.Validators.validate_no_emojis(:first_name)
    |> Stitch.Validators.validate_no_emojis(:last_name)
    |> unique_constraint(:mrn, name: :patients_mrn_team_id_index)
    |> unique_constraint(:email, name: :patients_email_team_id_index)
  end

  def disabled_changeset(%Patient{} = struct, disabled) do
    struct |> cast(%{disabled: disabled}, [:disabled])
  end

  @doc """
  Helper function to add a patient given a map of attributes
  """
  @spec create(integer, map) :: {:ok, Patient.t()} | {:error, Ecto.Changeset.t()}
  def create(team_id, params) do
    changeset = changeset(%Patient{team_id: team_id}, params)
    Repo.insert(changeset)
  end

  @doc """
  Creates the patient as a provider. Removed any given onboarded value.
  """
  @spec create_as_provider(integer, map) :: {:ok, Patient.t()} | {:error, Ecto.Changeset.t()}
  def create_as_provider(team_id, params) do
    overridden_params = params |> Map.delete("onboarded")
    create(team_id, overridden_params)
  end

  @doc """
  Updates the patient as a provider.
  """
  @spec update_as_provider(Patient.t(), map) :: {:ok, Patient.t()} | {:error, Ecto.Changeset.t()}
  def update_as_provider(patient, params) do
    case patient.onboarded do
      true ->
        # Don't update if onboarded (and now in user's control)
        {:ok, patient}

      false ->
        patient
        |> changeset(Map.delete(params, "onboarded"))
        |> Repo.update()
    end
  end

  @doc """
  Changes a patient to/drom disabled.
  """
  @spec change_disabled_status_as_provider(t(), boolean) :: {:ok, map} | {:error, map}
  def change_disabled_status_as_provider(patient, disabled_status) do
    patient
    |> disabled_changeset(disabled_status)
    |> Repo.update()
  end
end
