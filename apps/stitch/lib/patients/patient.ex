defmodule Stitch.Patient do
  @moduledoc """
  The Patient schema module.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias Stitch.{
    Repo,
    Patient,
    Team,
    User.Authentication
  }

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

  @patient_changeable_attrs [
    :first_name,
    :last_name,
    :phone_number
  ]

  schema "patients" do
    belongs_to(:team, Team)

    field(:first_name, :string)
    field(:last_name, :string)
    field(:email, :string)
    field(:phone_number, :string)
    field(:mrn, :string)
    field(:password_hash, :string)

    field(:disabled, :boolean, default: false)
    field(:onboarded, :boolean, default: false)

    field(:profile_image_url, :string)
    field(:profile_image_thumb_url, :string)

    field(:token, :string)
    has_one(:invitation, Stitch.Invitation, on_delete: :delete_all)
    has_many(:password_reset_token, Stitch.Accounts.PasswordResetToken, on_delete: :delete_all)
    field(:confirmation_code, :string)
    field(:email_confirmed, :boolean, default: false)

    field(:password, :string, virtual: true)

    timestamps()
  end

  def changeset(%Stitch.Patient{} = struct, attrs) do
    struct
    |> cast(attrs, @cs_attributes)
    |> validate_required(@required_attributes)
    |> Stitch.Validators.valid_email_changeset(attrs)
    |> Stitch.Accounts.ProfileImage.default_profile_image_changeset(attrs)
    |> update_change(:email, &String.trim/1)
    |> Stitch.Validators.validate_no_emojis(:first_name)
    |> Stitch.Validators.validate_no_emojis(:last_name)
    |> unique_constraint(:mrn, name: :patients_mrn_team_id_index)
    |> unique_constraint(:email, name: :patients_email_team_id_index)
  end

  def patient_update_changeset(%Stitch.Patient{} = struct, attrs) do
    struct
    |> cast(attrs, @patient_changeable_attrs)
    |> validate_required(@required_attributes)
    |> Stitch.Accounts.ProfileImage.default_profile_image_changeset(attrs)
    |> Stitch.Validators.validate_no_emojis(:first_name)
    |> Stitch.Validators.validate_no_emojis(:last_name)
  end

  def disabled_changeset(%Patient{} = struct, disabled) do
    struct |> cast(%{disabled: disabled}, [:disabled])
  end

  def onboarding_complete_changeset(%Stitch.Patient{} = struct, attrs \\ %{}) do
    struct
    |> cast(attrs, [:first_name, :last_name, :password, :phone_number])
    |> validate_required([:first_name, :last_name, :password])
    |> put_change(:password_hash, Authentication.hash_password(attrs["password"]))
    |> put_change(:onboarded, true)
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
  Updates the patient as themselves.
  """
  @spec update_as_patient(Patient.t(), map) :: {:ok, Patient.t()} | {:error, Ecto.Changeset.t()}
  def update_as_patient(patient, params) do
    patient
    |> patient_update_changeset(params)
    |> Repo.update()
  end

  @doc """
  Changes a patient to/from disabled.
  """
  @spec change_disabled_status_as_provider(t(), boolean) :: {:ok, map} | {:error, map}
  def change_disabled_status_as_provider(patient, disabled_status) do
    patient
    |> disabled_changeset(disabled_status)
    |> Repo.update()
  end

  def prep_for_invitation(patient, params) do
    patient |> invite_changeset(params) |> Repo.update()
  end

  @doc """
  Applies the attributes: email, team_id to the Stitch.Accounts.User struct.
  """
  def invite_changeset(struct, params) do
    digits = for _ <- 1..6, do: :rand.uniform(9)

    confirmation_code =
      digits
      |> Enum.join()

    token = Stitch.Rand.token(32)

    struct
    |> cast(params, [])
    |> put_change(:confirmation_code, confirmation_code)
    |> put_change(:token, token)
  end
end
