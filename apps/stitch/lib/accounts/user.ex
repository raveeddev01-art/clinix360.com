defmodule Stitch.Accounts.User do
  @moduledoc """
  The User schema module.
  """
  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.Accounts.User

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
    belongs_to :team, Stitch.Team
    has_one :invitation, Stitch.Invitation, on_delete: :delete_all

    field :password, :string, virtual: true

    timestamps()
  end

  @doc """
  Applies the attributes: email, confirmation_code and token
  to the Stitch.Accounts.User struct.

  ## Examples

      user = %Stitch.Accounts.User{}
      Stitch.Accounts.User.email_changeset(user, %{email: "a@email.com", confirmation_code: "123456", token: "abc"})

  """
  def email_changeset(struct, attrs) do
    struct
    |> cast(attrs, [:email, :confirmation_code, :token])
    |> validate_required([:email, :confirmation_code, :token])
    |> validate_format(:email, ~r/@/)
  end

  @doc """
  Applies the attributes: email, team_id to the Stitch.Accounts.User struct.
  """
  def team_invite_changeset(struct, params) do
    digits = for _ <- 1..6, do: :rand.uniform(9)
    confirmation_code = digits
      |> Enum.join

    token = :crypto.strong_rand_bytes(32) |> Base.url_encode64 |> binary_part(0, 32)

    struct
    |> cast(params, [:team_id])
    |> validate_required([:team_id])
    |> put_change(:confirmation_code, confirmation_code)
    |> put_change(:token, token)
    |> email_changeset(params)
    |> unique_constraint(:team_id, name: :users_email_team_id_index)
  end

  # ====

  def onboarding_complete_changeset(struct, params) do
    struct
    |> cast(params, [:first_name, :last_name, :username, :password, :pin, :team_id, :roles])
    |> unique_constraint(:team_id, name: :users_email_team_id_index)
    |> validate_required([:username, :pin, :team_id, :roles])
    |> put_change(:onboarded, true)
  end

  def password_update_changeset(struct, params) do
    struct
    |> cast(params, [:password])
    |> validate_required([:password])
  end
end