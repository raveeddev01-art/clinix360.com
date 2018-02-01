defmodule Stitch.User.Authentication do
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{Repo, Accounts.User, UserQueries, Team}

  def hash_password(password) do
    Comeonin.Bcrypt.hashpwsalt(password)
  end

  def create_account(user_params) do
    changeset = User.registration_changeset(%User{}, user_params)

    changeset =
      case changeset do
        %Ecto.Changeset{valid?: true, changes: %{password: pass}} ->
          put_change(changeset, :password_hash, hash_password(pass))

        _ ->
          changeset
      end

    case changeset.valid? do
      true ->
        {:ok, user} = Repo.insert(changeset)
        user

      false ->
        changeset
    end
  end

  def validate_email_and_password(email, password, team_slug)
      when byte_size(email) > 0 and byte_size(password) > 0 and byte_size(team_slug) > 0 do
    case Repo.get_by(Team, slug: team_slug) do
      nil ->
        false

      team ->
        case UserQueries.team_member_with_email(team.id, email) do
          nil ->
            Comeonin.Bcrypt.dummy_checkpw()

          user ->
            # This is used to hash legacy Meteor passwords.
            # password = if team.is_legacy, do: Base.encode16(:crypto.hash(:sha256, password), case: :lower), else: password
            case Comeonin.Bcrypt.checkpw(password, user.password_hash) do
              true ->
                user

              _ ->
                false
            end
        end
    end
  end

  def validate_email_and_password(_email, _password, _team_slug), do: false

  def user_for_token(token) do
    Repo.get_by(User, token: token, disabled: false)
  end

  def update_password(id, password) do
    user = Repo.get!(User, id)
    changeset = User.password_update_changeset(user, %{password: password})

    changeset =
      case changeset do
        %Ecto.Changeset{valid?: true, changes: %{password: pass}} ->
          put_change(changeset, :password_hash, hash_password(pass))

        _ ->
          changeset
      end

    case Repo.update(changeset) do
      {:ok, _} ->
        true

      {:error, _} ->
        {:error, "The password wasn't updated"}
    end
  end

  @spec check_for_valid_reset_token(binary) :: boolean
  def check_for_valid_reset_token(token) do
    !!UserQueries.get_by_password_reset_token(token)
  end

  @spec create_reset_password_token_for_user(Team.t, binary) :: {:ok, User.t} | {:error, Changeset.t} | {:error, binary}
  def create_reset_password_token_for_user(%Team{} = team, email) do
    with %User{} = user <- Stitch.UserQueries.team_member_with_email(team.id, email) do
      user
      |> change(password_reset_token: Stitch.Rand.token(32))
      |> Repo.update()
    else nil ->
      {:error, "User is not part of the team or Email does not exist"}
    end
  end

  @doc """
  Finds a user by the password reset token, resets their password and updates authentication token.
  Updating authentication token invalidates all user's sessions.
  """
  @spec reset_password_for_user(binary, binary) :: {:ok, User.t} | {:error, Changeset.t}
  def reset_password_for_user(token, password) do
    with %User{} = user <- UserQueries.get_by_password_reset_token(token) do
      user
      |> change(password_hash: hash_password(password))
      |> change(password_reset_token: nil)
      |> change(token: Stitch.Rand.token(32))
      |> Repo.update
    else nil ->
      {:error, "Token is invalid or already used"}
    end
  end
end
