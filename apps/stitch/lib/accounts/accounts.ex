defmodule Stitch.Accounts do
  @moduledoc """
  The Accounts context.
  """

  alias Stitch.Repo
  alias Stitch.Accounts.User

  @doc """
  Create a user with only the email field set. The user is not
  associated with any team.

  ## Examples

      Stitch.Accounts.create_user_with_email_only("sergiotapia@outlook.com")
      {:ok, %Stitch.Accounts.User{}}

      Stitch.Accounts.create_user_with_email_only("")
      {:error, "Email cannot be blank or nil."}

      Stitch.Accounts.create_user_with_email_only(nil)
      {:error, "Email cannot be blank or nil."}

  """
  def create_user_with_email_only(email) when byte_size(email) > 0 do
    digits = for _ <- 1..6, do: :rand.uniform(9)
    confirmation_code = digits
      |> Enum.join

    token = :crypto.strong_rand_bytes(32) |> Base.url_encode64 |> binary_part(0, 32)

    %User{}
    |> User.email_changeset(%{email: email, confirmation_code: confirmation_code, token: token})
    |> Repo.insert
  end
  def create_user_with_email_only(_), do: {:error, "Email cannot be blank or nil."}

  @doc """
  Updates an existing user with the onboarding attributes
  and sets the user's onboarded attribute to true.

  ## Examples

      attrs = %{
        fullname: "Sergio Tapia",
        username: "sergiotapia",
        password: "Password123!",
        pin: "0000",
        team_id: 1
      }
      Stitch.Accounts.update_and_complete_user_onboarding(1, attrs)

  """
  def update_and_complete_user_onboarding(user_id, attrs) do
    case Repo.get(User, user_id) do
      nil ->
        {:error, "User doesn't exist."}
      user ->
        if user.onboarded do
          {:error, "Cannot update a user who has already been onboarded."}
        else
          changeset = User.onboarding_complete_changeset(user, attrs)
          changeset =
            case changeset do
              %Ecto.Changeset{valid?: true, changes: %{password: pass}} ->
                Ecto.Changeset.put_change(changeset, :encrypted_password, Comeonin.Bcrypt.hashpwsalt(pass))
              _ ->
                changeset
            end

          case Repo.update(changeset) do
            {:ok, user} ->
              user
            {:error, _} ->
              {:error, "Could not finish onboarding user."}
          end
        end
    end
  end
end