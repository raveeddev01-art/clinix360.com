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
                Ecto.Changeset.put_change(changeset, :password_hash, Comeonin.Bcrypt.hashpwsalt(pass))
              _ ->
                changeset
            end

          case Repo.update(changeset) do
            {:ok, user} ->
              analytics_identify_and_group(user)
              {:ok, _} = Stitch.Group.create_single_dm(user, [user.id, user.id])
              user
            {:error, _} ->
              {:error, "Could not finish onboarding user."}
          end
        end
    end
  end

  defp analytics_identify_and_group(user) do
    Task.start(fn ->
      Stitch.Analytics.identify(user.id, %{"email" => user.email})
      team_id = user.team_id
      team = Stitch.TeamQueries.get_by_id(team_id)
      traits = %{"team_name" => team.name}
      Stitch.Analytics.group(%{user_id: user.id, team_id: team_id}, traits)
    end)
  end

  @doc """
  Create a new user with the onboarding attributes
  and sets the user's onboarded attribute to true.

  ## Examples

      attrs = %{
        email: "sergio@gmail.com",
        fullname: "Sergio Tapia",
        username: "sergiotapia",
        password: "Password123!",
        pin: "0000",
        roles: ["admin"],
        team_id: 1
      }
      Stitch.Accounts.create_and_complete_user_onboarding(attrs)

  """
  def create_and_complete_user_onboarding(attrs) do
    {email, attrs} = Map.pop(attrs, :email)
    case create_user_with_email_only(email) do
      %User{} = user -> update_and_complete_user_onboarding(user.id, attrs)
      {:error, reason} -> {:error, reason}
    end
  end

  @doc """
      Updates the user password by taking in old password and the new password.
      If the old password provided is not valid than the password is not changed and error is returned

  ## Examples
      {:ok, user} = Stitch.Accounts.update_user_password(2,"CorrectOldPassword","NewValidPassword")
      {:error, message} = Stitch.Accounts.update_user_password(2,"IncorrectOldPassword","ValidNewPassword")
  """
  def update_user_password(user_id,old_password,new_password)
  when is_integer(user_id) and byte_size(old_password) > 0 and byte_size(new_password) > 0 do
     case Repo.get(User,user_id) do
        nil -> {:error, "User doesn't exist"}

        user ->  case Comeonin.Bcrypt.checkpw(old_password, user.password_hash) do
                    true ->  changeset = Ecto.Changeset.change(user, password_hash: Comeonin.Bcrypt.hashpwsalt(new_password))

                              case Repo.update(changeset) do
                                {:ok,user} -> {:ok,user}
                                {:error, _} -> {:error, "Cannot change the password of user"}
                              end

                    false -> {:error, "Invalid Password for user"}
                 end
     end
  end

  def update_user_password(_,_,_), do: {:error, "Invalid Parameters provided for password update"}

  def get_for_team_id(user_id, team_id) do
    Repo.get_by(User, id: user_id, team_id: team_id)
  end
end
