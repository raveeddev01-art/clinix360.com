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

  @doc """
  Applies the attributes: email, confirmation_code and token
  to the Stitch.Accounts.User struct.

  ## Examples

      user = %Stitch.Accounts.User{}
      Stitch.Accounts.User.email_changeset(user, %{email: "a@email.com", confirmation_code: "123456", token: "abc"})

  """
  def email_changeset(%User{} = user, attrs) do
    user
    |> cast(attrs, [:email, :confirmation_code, :token])
    |> validate_required([:email, :confirmation_code, :token])
    |> validate_format(:email, ~r/@/)
  end


  # @doc """
  # Changeset to create a User record for a team invite. Creates
  # account with only email, invite_token and team_id.
  # """
  # def team_invite_changeset(struct, params) do
  #   invite_token = :crypto.strong_rand_bytes(32) |> Base.url_encode64 |> binary_part(0, 32)

  #   struct
  #   |> onboarding_email_changeset(params)
  #   |> cast(params, [:team_id])
  #   |> validate_required([:team_id])
  #   |> unique_constraint(:team_id, name: :users_email_team_id_index)
  #   |> put_change(:invite_token, invite_token)
  # end

  # ====

  @doc """
  Changeset to create a User record for a team invite. Creates
  account with only email, invite_token and team_id.
  """
  def team_invite_changeset(struct, params) do
    invite_token = :crypto.strong_rand_bytes(32) |> Base.url_encode64 |> binary_part(0, 32)

    struct
    |> email_changeset(params)
    |> cast(params, [:team_id])
    |> validate_required([:team_id])
    |> unique_constraint(:team_id, name: :users_email_team_id_index)
    |> put_change(:invite_token, invite_token)
  end

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