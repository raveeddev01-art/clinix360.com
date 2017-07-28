defmodule Stitch.Accounts do
  @moduledoc """
  The Accounts context.
  """

  alias Stitch.Repo
  alias Stitch.Accounts.User
  alias Stitch.Team

  @spec invite_to_team(number, number, String.t) :: {:ok, String.t} | {:error, String.t}
  @doc """
  Send a team invite to a given email address. This also creates a user
  with the given email and team_id as a placeholder for the incoming user.

  ## Examples

      Stitch.Accounts.invite_to_team(team.id, user.id, "john@email.com")

  """
  def invite_to_team(team_id, inviting_user_id, email)
  when is_integer(team_id) and byte_size(email) > 0 and is_integer(inviting_user_id) do
    inviting_user = Repo.get(User, inviting_user_id)
    team = Repo.get(Team, team_id)
    user = User.team_invite_changeset(%User{}, %{
      email: email,
      team_id: team_id
    })
    case Repo.insert(user) do
      {:ok, user} ->
        Stitch.Accounts.Email.team_invitation("#{inviting_user.first_name} #{inviting_user.last_name}", team, user)
        {:ok, user}
      {:error, changeset} ->
        {:error, changeset}
    end
  end
  def invite_to_team(_, _, _), do: {:error, "Cannot be nil or blank: team_id, inviting_user_id, email."}

  @doc """
  Finds the user associated with the invite_token and sets onboarded
  to true.
  """
  def accept_team_invitation(invite_token) do
    # TODO
  end

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

    {:ok, user} =
      %User{}
      |> User.email_changeset(%{email: email, confirmation_code: confirmation_code, token: token})
      |> Repo.insert
    user
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
        roles: ["admin"],
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