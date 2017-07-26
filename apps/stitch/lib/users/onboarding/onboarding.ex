defmodule Stitch.User.Onboarding do
  @moduledoc """
  Onboarding module used to onboard new users to the Stitch
  platform and Teams within the Stitch platofrm.
  """

  alias Stitch.{Repo, User}

  def send_confirmation_code(id) do
    case Repo.get(User, id) do
      nil ->
        {:error, "User doesn't exist."}
      user ->
        Stitch.Accounts.Email.confirmation_code_email(user)
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
