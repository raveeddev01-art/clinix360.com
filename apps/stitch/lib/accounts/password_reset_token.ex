defmodule Stitch.Accounts.PasswordResetToken do
  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.Accounts.PasswordResetToken

  schema "password_reset_tokens" do
    belongs_to :user, Stitch.Accounts.User
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
end
