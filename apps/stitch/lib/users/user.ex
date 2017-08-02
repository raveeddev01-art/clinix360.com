# DO NOT USE THIS MODULE, WE'RE GOING TO PHASE IT OUT.
defmodule Stitch.User do
  use Ecto.Schema
  import Ecto.Changeset

  # DO NOT USE THIS MODULE, WE'RE GOING TO PHASE IT OUT.
  # Use Stitch.Accounts.User instead
  schema "users" do
    field :email, :string
    field :roles, {:array, :string}
    field :encrypted_password, :string
    field :first_name, :string
    field :last_name, :string
    field :phone_number, :string
    field :profile_image_url, :string
    field :confirmation_code, :string
    field :title, :string
    field :email_confirmed, :boolean, default: false
    field :onboarded, :boolean, default: false
    field :username, :string
    field :pin, :string
    field :token, :string
    field :disabled, :boolean, default: false
    belongs_to :team, Stitch.Team
    has_one :invitation, Stitch.Invitation, on_delete: :delete_all

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

  def password_update_changeset(struct, params) do
    changeset =
      struct
      |> changeset(params)
      |> cast(params, [:password])
      |> validate_required([:password])

    changeset =
      case changeset do
        %Ecto.Changeset{valid?: true, changes: %{password: pass}} ->
          put_change(changeset, :encrypted_password, Comeonin.Bcrypt.hashpwsalt(pass))
        _ ->
          changeset
      end
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
end