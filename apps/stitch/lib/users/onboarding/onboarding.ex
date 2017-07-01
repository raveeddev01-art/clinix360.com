defmodule Stitch.User.Onboarding do
  @moduledoc """
  Onboarding module used to onboard new users to the Stitch
  platform and Teams within the Stitch platofrm.
  """

  import Ecto.Changeset
  alias Stitch.{Repo, User}

  def create_user_with_email(email) when byte_size(email) > 0 do
    changeset = User.onboarding_email_changeset(%User{}, %{email: email})
    {:ok, user} = Repo.insert(changeset)
    user
  end

  def create_user_with_email(_) do
    {:error, "Email cannot be nil or blank"}
  end

  def send_confirmation_code(%{"email" => email}) do

  end

  # # OLD.
  # def submit_confirmation_code(user_id, confirmation_code) do
  #   case Stitch.UserQueries.get_by_id(user_id) do
  #     {:not_found, message} ->
  #       false
  #     user ->
  #       user.confirmation_code == confirmation_code
  #   end
  # end
end