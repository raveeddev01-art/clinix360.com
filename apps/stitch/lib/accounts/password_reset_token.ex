defmodule Stitch.Accounts.PasswordResetToken do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.Accounts.{User, PasswordResetToken}
  alias Stitch.Repo

  @type t :: %__MODULE__{}

  schema "password_reset_tokens" do
    belongs_to :user, User
    field :activated_at, :naive_datetime
    field :valid, :boolean, default: true
    field :token, :string

    timestamps updated_at: false
  end

  @doc """
  Creates a new password reset token changeset
  """
  @spec new(map) :: Ecto.Changeset.t()
  def new(params \\ %{}) do
    fields = ~w(user_id)a

    %PasswordResetToken{}
    |> cast(params, fields)
    |> validate_required(fields)
    |> put_change(:token, Stitch.Rand.token(32))
    |> unique_constraint(:token, name: :password_reset_tokens_token_index)
  end

  @spec create_for_user(User.t) :: {:ok, PasswordResetToken.t} | {:error, Ecto.Changeset.t}
  def create_for_user(%User{} = user) do
    %{user_id: user.id}
    |> new()
    |> Repo.insert
  end

  @spec get_valid_token(binary) :: PasswordResetToken.t | nil
  def get_valid_token(token) do
    PasswordResetToken
    |> join(:left, [p], u in assoc(p, :user))
    |> where([p, u], p.token == ^token)
    |> where([p, u], p.inserted_at >= datetime_add(^NaiveDateTime.utc_now, -24, "hour"))
    |> where([p, u], is_nil(p.activated_at) or p.activated_at >= datetime_add(^NaiveDateTime.utc_now, -30, "minute"))
    |> preload(:user)
    |> Repo.one
  end

  @spec activate(PasswordResetToken.t) :: {:ok, PasswordResetToken.t} | {:error, Changeset.t}
  def activate(%PasswordResetToken{} = password_reset_token) do
    password_reset_token
    |> change(activated_at: NaiveDateTime.utc_now())
    |> Repo.update
  end

  @spec user_tokens(User.t) :: Ecto.Queryable.t
  def user_tokens(%User{} = user) do
    PasswordResetToken
    |> where(user_id: ^user.id)
  end
end
