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
    patient = %Patient{}
    changeset = changeset(patient, params)
    Repo.insert(changeset)
  end
end
