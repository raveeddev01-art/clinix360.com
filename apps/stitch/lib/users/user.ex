defmodule Stitch.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :email, :string
    field :roles, {:array, :string}
    field :encrypted_password, :string
    field :first_name, :string
    field :last_name, :string
    field :phone_number, :string
    field :profile_image_url, :string
    field :title, :string
    field :confirmation_code, :string
    field :invite_token, :string
    field :email_confirmed, :boolean, default: false
    field :onboarded, :boolean, default: false
    field :username, :string
    field :pin, :string
    field :token, :string
    belongs_to :team, Stitch.Team

    field :password, :string, virtual: true

    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:first_name, :last_name, :email, :pin, :phone_number, :title, :profile_image_url, :username])
    |> unique_constraint(:username, name: :users_username_team_id_index)
    |> unique_constraint(:email, name: :users_email_team_id_index)
    |> validate_required([:first_name, :last_name])
  end

  def registration_changeset(struct, params) do
    struct
    |> changeset(params)
    |> cast(params, [:email, :password])
    |> validate_length(:password, min: 8)
  end

  def onboarding_complete_changeset(struct, params) do
    struct
    |> cast(params, [:first_name, :last_name, :username, :password, :pin, :team_id])
    |> validate_required([:username, :pin, :team_id])
    |> put_change(:onboarded, true)
  end

  def password_update_changeset(struct, params) do
    struct
    |> changeset(params)
    |> cast(params, [:password])
    |> validate_required([:password])
  end
end