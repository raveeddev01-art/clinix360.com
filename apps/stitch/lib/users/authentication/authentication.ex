defmodule Stitch.User.Authentication do
  import Ecto.Changeset
  alias Ecto.Changeset
  alias Ecto.Multi

  alias Stitch.{
    Repo,
    Accounts.User,
    Accounts.PasswordResetToken,
    UserQueries,
    Team,
    Patient,
    PatientQueries
  }

  def hash_password(password) do
    Bcrypt.hash_pwd_salt(password)
  end

  @spec validate_user_email_and_password(binary, binary, Team.t()) :: User.t() | boolean
  def validate_user_email_and_password(email, password, team) do
    user = UserQueries.team_member_with_email(team.id, email)
    do_validate_email_and_password(user, password)
  end

  @spec validate_patient_email_and_password(integer, binary, binary) :: Patient.t() | boolean
  def validate_patient_email_and_password(team_id, email, password) do
    patient = PatientQueries.for_team_and_email(team_id, email)
    do_validate_email_and_password(patient, password)
  end

  @spec do_validate_email_and_password(User.t() | Patient.t() | nil, binary) ::
          boolean | Patient.t() | User.t()
  defp do_validate_email_and_password(nil = _user_or_patient, _), do: false

  defp do_validate_email_and_password(user_or_patient, password) do
    Bcrypt.verify_pass(password, user_or_patient.password_hash) && user_or_patient
  end

  @spec password_update_changeset(User.t() | Patient.t(), map) :: Changeset.t()
  def password_update_changeset(user_or_patient, params) do
    user_or_patient
    |> cast(params, [:password])
    |> validate_required([:password])
    |> put_new_password()
    |> put_change(:token, Stitch.Rand.token(32))
  end

  @spec put_new_password(Changeset.t()) :: Changeset.t()
  def put_new_password(
        %Changeset{valid?: true, changes: %{password: new_password}, data: user_or_patient} =
          changeset
      ) do
    if user_or_patient.password_hash != nil and
      Bcrypt.verify_pass(new_password, user_or_patient.password_hash) do
      changeset
      |> add_error(:password, "The new password must be different from the old one")
    else
      changeset
      |> put_change(:password_hash, hash_password(new_password))
    end
  end

  def put_new_password(changeset), do: changeset

  @doc """
  Authenticates a user or patient with the current password and updates it.
  """
  @spec update_password(User.t() | Patient.t(), binary, binary) ::
          {:ok, User.t() | Patient.t()} | {:error, binary} | {:error, Changeset.t()}
  def update_password(user_or_patient, current_password, new_password) do
    with {:authenticated?, true} <-
           {:authenticated?,
            Bcrypt.verify_pass(current_password, user_or_patient.password_hash)} do
      user_or_patient
      |> password_update_changeset(%{password: new_password})
      |> Repo.update()
    else
      {:authenticated?, false} -> {:error, "Invalid password"}
    end
  end

  @doc """
  Removes existing password reset tokens, updates the password and authentication token.
  Updated authentication token, in effect, invalidates all user's sessions.
  """
  @spec reset_password(User.t() | Patient.t(), binary) ::
          {:ok, %{tokens: any, user: User.t()}}
          | {:ok, %{tokens: any, patient: Patient.t()}}
          | {:error, any}
          | {:error, atom, any, %{optional(atom) => any}}
  def reset_password(%User{} = user, password) do
    Multi.new()
    |> Multi.delete_all(:tokens, PasswordResetToken.user_tokens(user))
    |> Multi.update(:user, password_update_changeset(user, %{password: password}))
    |> Repo.transaction()
  end

  def reset_password(%Patient{} = patient, password) do
    Multi.new()
    |> Multi.delete_all(:tokens, PasswordResetToken.patient_tokens(patient))
    |> Multi.update(:patient, password_update_changeset(patient, %{password: password}))
    |> Repo.transaction()
  end
end
