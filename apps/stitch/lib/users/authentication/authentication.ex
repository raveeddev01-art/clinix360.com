defmodule Stitch.User.Authentication do
  import Ecto.Changeset
  alias Stitch.{Repo, User}

  def hash_password(password) do
    Comeonin.Bcrypt.hashpwsalt(password)
  end

  def create_account(user_params) do
    changeset = User.registration_changeset(%User{}, user_params)
    changeset = case changeset do
      %Ecto.Changeset{valid?: true, changes: %{password: pass}} ->
        put_change(changeset, :encrypted_password, hash_password(pass))
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

  def validate_email_and_password(email, password)
  when byte_size(email) > 0 and byte_size(password) > 0 do
    case Repo.get_by(User, email: email) do
      nil -> Comeonin.Bcrypt.dummy_checkpw()
      user -> Comeonin.Bcrypt.checkpw(password, user.encrypted_password)
    end
  end

  def update_password(id, password) do
    user = Repo.get!(User, id)
    changeset = User.password_update_changeset(user, %{password: password})
    changeset = case changeset do
      %Ecto.Changeset{valid?: true, changes: %{password: pass}} ->
        put_change(changeset, :encrypted_password, hash_password(pass))
      _ ->
        changeset
    end

    case Repo.update(changeset) do
      {:ok, user} ->
        true
      {:error, _} ->
        {:error, "The password wasn't updated"}
    end
  end
end