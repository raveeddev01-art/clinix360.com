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

  @required_attributes [:first_name, :last_name, :email]

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
    |> Stitch.Validators.valid_email_changeset(attrs)
    |> validate_required(@required_attributes)
    |> default_profile_image_changeset(attrs)
    |> update_change(:email, &String.trim/1)
    |> unique_constraint(:email)
    |> Stitch.Validators.validate_no_emojis(:first_name)
    |> Stitch.Validators.validate_no_emojis(:last_name)
  end

  # TODO: Remove from usr and put in shared spot
  def default_profile_image_changeset(struct, params) do
    changeset =
      struct
      |> cast(params, [:profile_image_url, :profile_image_thumb_url])

    cond do
      Stitch.Accounts.ProfileImage.needs_avatar_regen(changeset) ->
        add_default_profile_image(changeset)

      true ->
        changeset
    end
  end

  def add_default_profile_image(%{valid?: true} = changeset) do
    patient = %Stitch.Patient{
      first_name: get_first_name(changeset),
      last_name: get_last_name(changeset)
    }

    with {:ok, avatar} <- Stitch.Accounts.ProfileImage.pick_default_random(patient),
         {:ok, avatar_thumb} <- Stitch.Accounts.ProfileImage.create_thumb(avatar) do
      changeset
      |> put_change(:profile_image_url, avatar)
      |> put_change(:profile_image_thumb_url, avatar_thumb)
    else
      _ ->
        changeset
    end
  end

  def add_default_profile_image(changeset), do: changeset

  defp get_first_name(changeset) do
    case Ecto.Changeset.fetch_change(changeset, :first_name) do
      {:ok, first_name} ->
        first_name

      _ ->
        changeset.data.first_name
    end
  end

  defp get_last_name(changeset) do
    case Ecto.Changeset.fetch_change(changeset, :last_name) do
      {:ok, last_name} ->
        last_name

      _ ->
        changeset.data.last_name
    end
  end

  @doc """
  TODO: REMOVE ME OR FILL OUT
  """
  @spec create(map) :: {:ok, Patient.t()} | {:error, Ecto.Changeset.t()}
  def create(params) do
    patient = %Patient{}
    changeset = changeset(patient, params)
    Repo.insert(changeset)
  end
end
