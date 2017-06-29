defmodule Stitch.User.Onboarding do
  import Ecto.Changeset
  alias Stitch.{Repo, User}

  def create_user_with_email(email) do
    changeset = User.onboarding_email_changeset(%User{}, %{email: email})
    case Repo.insert(changeset) do
      {:ok, user} ->
        user
      _ ->
        {:error, "User already exists with that email"}
    end
  end

  def put_confirmation_code(changeset) do
    digits = for _ <- 1..6, do: :rand.uniform(9)
    confirmation_code = digits
      |> Enum.join

    put_change(changeset, :confirmation_code, confirmation_code)
  end

  def submit_confirmation_code(user_id, confirmation_code) do
    case Stitch.UserQueries.get_by_id(user_id) do
      {:not_found, message} ->
        false
      user ->
        user.confirmation_code == confirmation_code
    end
  end
end