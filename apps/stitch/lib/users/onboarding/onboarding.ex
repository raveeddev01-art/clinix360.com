defmodule Stitch.User.Onboarding do
  @moduledoc """
  Onboarding module used to onboard new users to the Stitch
  platform and Teams within the Stitch platofrm.
  """

  alias Stitch.{Repo, User}

  def create_user_with_email(email) when byte_size(email) > 0 do
    changeset = User.onboarding_email_changeset(%User{}, %{email: email})
    {:ok, user} = Repo.insert(changeset)
    user
  end

  def create_user_with_email(_) do
    {:error, "Email cannot be nil or blank"}
  end

  def send_confirmation_code(id) do
    case Repo.get(User, id) do
      nil ->
        {:error, "User doesn't exist."}
      user ->
        Stitch.User.Onboarding.Email.confirmation_code_email(user)
    end
  end

  def verify_confirmation_code(user_id, confirmation_code) do
    user = Repo.get(User, user_id)
    if user.confirmation_code == confirmation_code do
      user = Ecto.Changeset.change user, email_confirmed: true
      Repo.update(user)
      true
    else
      false
    end
  end
end
