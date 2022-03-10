defmodule Stitch.Accounts do
  @moduledoc """
  The Accounts context.
  """

  alias Stitch.{Repo, Patient}
  alias Stitch.Accounts.User
  alias Stitch.Analytics.Accounts, as: AccountsAnalytics

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

    confirmation_code =
      digits
      |> Enum.join()

    token = Stitch.Rand.token(32)

    params = %{email: email, token: token, confirmation_code: confirmation_code}

    case User.email_changeset(%User{}, params) |> Repo.insert() do
      {:ok, user} -> user
      any -> any
    end
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
  @spec update_and_complete_user_onboarding(pos_integer, map) ::
          User.t() | {:error, Ecto.Changeset.t()} | {:error, binary}
  def update_and_complete_user_onboarding(user_id, attrs) do
    case Repo.get(User, user_id) do
      nil ->
        {:error, "User doesn't exist."}

      user ->
        if user.onboarded do
          {:error, "Cannot update a user who has already been onboarded."}
        else
          changeset =
            user
            |> User.onboarding_complete_changeset(attrs)
            |> Stitch.User.Authentication.put_new_password()

          case Repo.update(changeset) do
            {:ok, user} ->
              attrs
              |> Map.get("invites", [])
              |> Enum.each(&Stitch.Invitation.invite_to_team(user.id, &1))

              Stitch.Team.complete_onboarding(attrs)
              {:ok, _group} = Stitch.Group.create_single_dm(user, [user.id, user.id])

              AccountsAnalytics.track_signup(user)
              user

            {:error, changeset} ->
              {:error, changeset}
          end
        end
    end
  end

  @doc """
    Given a patient ID and attributes, change patient to be onboarded
    and update their attributes.

    Called after a patient gets an invite email and signs up.
  """
  @spec update_and_complete_patient_onboarding(integer, map) ::
          {:ok, Patient.t()} | {:error, binary}
  def update_and_complete_patient_onboarding(patient_id, attrs) do
    case Repo.get(Patient, patient_id) do
      %Patient{} = patient ->
        case patient.onboarded do
          true ->
            {:ok, patient}

          _ ->
            patient
            |> Patient.onboarding_complete_changeset(attrs)
            |> Repo.update()
        end

      _ ->
        {:error, "Patient does not exist"}
    end
  end

  def update_profile_image(user_id, url) do
    IO.inspect(url, label: "URL")

    User
    |> Repo.get(user_id)
    |> User.profile_image_changeset(%{"profile_image_url" => url})
    |> IO.inspect(label: "final profile image chnageset")
    |> Repo.update()
  end

  def delete_profile_image(user_id) do
    User
    |> Repo.get(user_id)
    |> Stitch.Accounts.ProfileImage.default_profile_image_changeset(%{
      profile_image_url: nil,
      profile_image_thumb_url: nil
    })
    |> IO.inspect(label: "profile image final changeset")
    |> Repo.update()
  end
end
