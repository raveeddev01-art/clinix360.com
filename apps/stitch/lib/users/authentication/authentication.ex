defmodule Stitch.User.Authentication do
  import Ecto.Changeset
  alias Ecto.Changeset
  alias Stitch.{Repo, Accounts.User, UserQueries, Team}

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

  @spec check_for_valid_reset_token(binary) :: boolean
  def check_for_valid_reset_token(token) do
    UserQueries.get_by_password_reset_token(token) || false
  end

  @spec create_reset_password_token(Team.t, binary) :: {:ok, User.t} | {:error, Changeset.t} | {:error, binary}
  def create_reset_password_token(%Team{} = team, email) do
    with %User{} = user <- Stitch.UserQueries.team_member_with_email(team.id, email) do
      user
      |> change(password_reset_token: Stitch.Rand.token(32))
      |> Repo.update()
    else nil ->
      {:error, "User is not part of the team or Email does not exist"}
    end
  end

  @spec password_update_changeset(User.t, map) :: Changeset.t
  def password_update_changeset(%User{} = user, params) do
    user
    |> cast(params, [:password])
    |> validate_required([:password])
    |> put_new_password()
    |> put_change(:password_reset_token, nil)
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
      {:authenticated?, false} -> {:error, "Invalid password for user"}
    end
  end

  @doc """
  Finds a user by the password reset token, resets their password and updates authentication token.
  Updating authentication token invalidates all user's sessions.
  """
  @spec reset_password(binary, binary) :: {:ok, User.t} | {:error, Changeset.t}
  def reset_password(token, password) do
    with %User{} = user <- UserQueries.get_by_password_reset_token(token) do
      user
      |> password_update_changeset(%{password: password})
      |> Repo.update
    else nil ->
      {:error, "Token is invalid or already used"}
    end
  end
end
