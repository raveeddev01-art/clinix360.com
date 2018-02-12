defmodule Stitch.User.Authentication do
  import Ecto.Changeset
  alias Ecto.Changeset
  alias Ecto.Multi
  alias Stitch.{Repo, Accounts.User, Accounts.PasswordResetToken, UserQueries, Team}

  def hash_password(password) do
    Comeonin.Bcrypt.hashpwsalt(password)
  end

  @spec validate_email_and_password(binary, binary, Team.t) :: User.t | boolean
  def validate_email_and_password(email, password, team) do
    with %User{} = user <- UserQueries.team_member_with_email(team.id, email) do
      Comeonin.Bcrypt.checkpw(password, user.password_hash) && user
    else nil ->
      Comeonin.Bcrypt.dummy_checkpw()
    end
  end

  @spec password_update_changeset(User.t, map) :: Changeset.t
  def password_update_changeset(%User{} = user, params) do
    user
    |> cast(params, [:password])
    |> validate_required([:password])
    |> put_new_password()
    |> put_change(:token, Stitch.Rand.token(32))
  end

  @spec put_new_password(Changeset.t) :: Changeset.t
  def put_new_password(%Changeset{valid?: true, changes: %{password: new_password}, data: %User{} = user} = changeset) do
    if user.password_hash != nil and Comeonin.Bcrypt.checkpw(new_password, user.password_hash) do
      changeset
      |> add_error(:password, "The new password must be different from the old one")
    else
      changeset
      |> put_change(:password_hash, hash_password(new_password))
    end
  end
  def put_new_password(changeset), do: changeset

  @doc """
  Authenticates a user with the current password and updates it.
  """
  @spec update_password(User.t, binary, binary) :: {:ok, User.t} | {:error, binary} | {:error, Changeset.t}
  def update_password(%User{} = user, current_password, new_password) do
    with {:authenticated?, true} <- {:authenticated?, Comeonin.Bcrypt.checkpw(current_password, user.password_hash)} do
      user
      |> password_update_changeset(%{password: new_password})
      |> Repo.update
    else
      {:authenticated?, false} -> {:error, "Invalid password"}
    end
  end

  @doc """
  Removes existing password reset tokens, updates the password and authentication token.
  Updated authentication token, in effect, invalidates all user's sessions.
  """
  @spec reset_password(User.t, binary) :: {:ok, %{tokens: any, user: User.t}} |
                                          {:error, any} |
                                          {:error, atom, any, %{optional(atom) => any}}
  def reset_password(%User{} = user, password) do
    Multi.new
    |> Multi.delete_all(:tokens, PasswordResetToken.user_tokens(user))
    |> Multi.update(:user, password_update_changeset(user, %{password: password}))
    |> Repo.transaction
  end
end
