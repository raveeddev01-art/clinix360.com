defmodule Stitch.User.Authentication do
  import Comeonin.Bcrypt
  import Ecto.Changeset
  alias Stitch.{Repo, User}

  def hash_password(password) do
    hashpwsalt(password)
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
      nil -> dummy_checkpw()
      user -> checkpw(password, user.encrypted_password)
    end
  end
end