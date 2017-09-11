defmodule Stitch.User.Authentication do
  import Ecto.Changeset
  alias Stitch.{Repo, Accounts.User, Team}

  def hash_password(password) do
    Comeonin.Bcrypt.hashpwsalt(password)
  end

  def create_account(user_params) do
    changeset = User.registration_changeset(%User{}, user_params)
    changeset = case changeset do
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
        case Repo.get_by(User, %{email: email, team_id: team.id}) do
          nil -> Comeonin.Bcrypt.dummy_checkpw()
          user ->
            case Comeonin.Bcrypt.checkpw(password, user.password_hash) do
              true ->
                user
              _ ->
                false
            end
        end
    end
  end

  def user_for_token(token) do
    Repo.get_by(User, token: token)
  end

  def update_password(id, password) do
    user = Repo.get!(User, id)
    changeset = User.password_update_changeset(user, %{password: password})
    changeset = case changeset do
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

  def check_for_valid_reset_token(token) do
     user = Repo.get_by(User, password_reset_token: token)
     if user != nil do
          user
     else
          false
     end
  end

  def create_reset_password_token_for_user(email, team_slug)
  when byte_size(email) > 0 and byte_size(team_slug) > 0 do
    team = Repo.get_by(Team, slug: team_slug)

    case Repo.get_by(User, email: email, team_id: team.id) do
        nil ->
          {:error, "User is not part of the team or Email does not exist"}

        user ->
          user
          |> Ecto.Changeset.change(password_reset_token: :crypto.strong_rand_bytes(32) |> Base.url_encode64 |> binary_part(0, 32) )
          |> Repo.update
    end
  end

  def reset_password_for_user(token, password)
  when byte_size(token) > 0 and byte_size(password) > 0 do

     case Repo.get_by(User, password_reset_token: token) do
        nil ->
            {:error, "Token is invalid or already used"}

        user ->
            user
            |> Ecto.Changeset.change(password_hash: hash_password(password), password_reset_token: nil)
            |> Repo.update
     end
   end

end
