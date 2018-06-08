defmodule Stitch.Patient do
  @moduledoc """
  The Patient schema module.
  """

  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.{Repo, TeamPatient, Patient}

  @type t :: %__MODULE__{}

  @cs_attributes [
    :first_name,
    :last_name,
    :email,
    :phone_number,
    :onboarded
  ]

  @required_attributes [:first_name, :last_name, :email, :onboarded]

  schema "patients" do
    has_many(:team_patients, TeamPatient, on_delete: :delete_all)
    has_many(:teams, through: [:team_patients, :team])

    field(:first_name, :string)
    field(:last_name, :string)
    field(:email, :string)
    field(:phone_number, :string)

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
  end

  @doc """
  Helper function to add a patient given a map of attributes
  """
  @spec create(map) :: {:ok, Patient.t()} | {:error, Ecto.Changeset.t()}
  def create(params) do
    changeset = changeset(%Patient{}, params)
    Repo.insert(changeset)
  end

  @doc """
  Creates the patient as a provider. Removed any given onboarded value.
  """
  @spec create_as_provider(map) :: {:ok, Patient.t()} | {:error, Ecto.Changeset.t()}
  def create_as_provider(params) do
    overridden_params = params |> Map.delete("onboarded")
    create(overridden_params)
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
end
