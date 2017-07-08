defmodule Stitch.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :email, :string
    field :roles, {:array, :string}
    field :encrypted_password, :string
    field :fullname, :string
    field :confirmation_code, :string
    field :invite_token, :string
    field :email_confirmed, :boolean, default: false
    field :onboarded, :boolean, default: false
    field :username, :string
    field :pin, :string
    belongs_to :team, Stitch.Team

    field :password, :string, virtual: true

    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:fullname])
    |> validate_required([:fullname])
  end

  def registration_changeset(struct, params) do
    struct
    |> changeset(params)
    |> cast(params, [:email, :password])
    |> validate_length(:password, min: 8)
  end

  def onboarding_email_changeset(struct, params) do
    digits = for _ <- 1..6, do: :rand.uniform(9)
    confirmation_code = digits
      |> Enum.join

    struct
    |> cast(params, [:email])
    |> validate_required([:email])
    |> validate_format(:email, ~r/@/)
    |> put_change(:confirmation_code, confirmation_code)
  end

  def onboarding_complete_changeset(struct, params) do
    struct
    |> cast(params, [:fullname, :username, :password, :pin, :team_id])
    |> validate_required([:username, :pin, :team_id])
    |> put_change(:onboarded, true)
  end

  def password_update_changeset(struct, params) do
    struct
    |> cast(params, [:password])
    |> validate_required([:password])
  end
end