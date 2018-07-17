defmodule Stitch.FindYourTeam do
  import Ecto.Query

  alias Stitch.Repo

  alias Stitch.{
    Accounts.User,
    FindYourTeam.Token,
    Patient,
    PatientQueries,
    Team,
    UserQueries
  }

  alias Ecto.Multi

  @doc """
  Creates a "team_list" token allowing a user to obtain "login" token (after visiting the page).
  Previously used find-you-team tokens, if any, are deleted upon the creation.
  """
  @spec create_team_list_token(binary | nil) ::
          {:ok, Token.t()} | {:error, binary} | {:error, Ecto.Changeset.t()}
  def create_team_list_token(nil), do: {:error, "Not found"}

  def create_team_list_token(email) do
    do_create_team_list_token(
      "team_list",
      &UserQueries.user_with_email_exists?/1,
      email
    )
  end

  @doc """
  Creates a "patient_team_list" token allowing a patient to obtain "login" token (after visiting the page).
  Previously used find-you-team tokens, if any, are deleted upon the creation.
  """
  @spec create_patient_team_list_token(binary | nil) ::
          {:ok, Token.t()} | {:error, binary} | {:error, Ecto.Changeset.t()}
  def create_patient_team_list_token(nil), do: {:error, "Not found"}

  def create_patient_team_list_token(email) do
    do_create_team_list_token(
      "patient_team_list",
      &PatientQueries.onboarded_patient_with_email_exists?/1,
      email
    )
  end

  defp do_create_team_list_token(token_type, existence_check, email) do
    if existence_check.(email) do
      delete_user_tokens(email)
      create_token(email, token_type)
    else
      {:error, "Not found"}
    end
  end

  @doc """
  Given a "team-list" token, removes it and creates a login token that allows
  the user to login to any of their teams.
  """
  @spec create_login_token(binary) :: {:ok, %{login_token: Token.t()}} | {:error, term}
  def create_login_token(token) do
    Multi.new()
    |> Multi.delete_all(:delete_team_list_token, get_team_list_token(token), returning: true)
    |> Multi.run(:login_token, Stitch.FindYourTeam, :login_token, [])
    |> Repo.transaction()
  end

  @doc """
  Given a "patient_team_list" token, removes it and creates a login token that allows
  the user to login to any of their teams.
  """
  @spec create_patient_login_token(binary) :: {:ok, %{login_token: Token.t()}} | {:error, term}
  def create_patient_login_token(token) do
    Multi.new()
    |> Multi.delete_all(
      :delete_team_list_token,
      get_team_list_token(token, "patient_team_list"),
      returning: true
    )
    |> Multi.run(:login_token, Stitch.FindYourTeam, :patient_login_token, [])
    |> Repo.transaction()
  end

  @doc """
  Finds the corresponding user for the given team and the find-your-team "login" token.
  Removes the token and returns the user.
  """
  @spec activate_login_token(Team.t(), binary) :: {:ok, User.t()} | {:error, term}
  def activate_login_token(%Team{} = team, token) do
    get_user_login_token = fn token ->
      get_login_token(token)
    end

    do_activate_login_token(
      team,
      token,
      get_user_login_token,
      &UserQueries.team_member_with_email/2
    )
  end

  @spec activate_patient_login_token(Team.t(), binary) :: {:ok, Patient.t()} | {:error, term}
  def activate_patient_login_token(%Team{} = team, token) do
    get_patient_login_token = fn token ->
      get_login_token(token, "patient_login")
    end

    do_activate_login_token(
      team,
      token,
      get_patient_login_token,
      &PatientQueries.team_member_with_email/2
    )
  end

  @spec do_activate_login_token(Team.t(), binary, fun, fun) ::
          {:ok, Patient.t() | User.t()} | {:error, term}
  defp do_activate_login_token(team, token, get_login_token, get_member_with_email) do
    with %Token{} = token <- get_login_token.(token),
         user_or_patient when not is_nil(user_or_patient) <-
           get_member_with_email.(team.id, token.email) do
      delete_user_tokens(user_or_patient.email)
      {:ok, user_or_patient}
    else
      _e -> {:error, "Error activating the token"}
    end
  end

  @spec login_token(map) :: {:ok, Token.t()} | {:error, Ecto.Changeset.t()}
  def login_token(%{delete_team_list_token: {1, [token]}}) do
    create_token(token.email, "login")
  end

  def login_token(%{delete_team_list_token: {0, []}}) do
    {:error, "Not found"}
  end

  @spec patient_login_token(map) :: {:ok, Token.t()} | {:error, Ecto.Changeset.t()}
  def patient_login_token(%{delete_team_list_token: {1, [token]}}) do
    create_token(token.email, "patient_login")
  end

  def patient_login_token(%{delete_team_list_token: {0, []}}) do
    {:error, "Not found"}
  end

  @spec get_team_list_token(binary, binary) :: Ecto.Queryable.t()
  defp get_team_list_token(token, type \\ "team_list") do
    Token
    |> where([t], t.inserted_at >= datetime_add(^NaiveDateTime.utc_now(), -24, "hour"))
    |> where(token: ^token)
    |> where(type: ^type)
  end

  @spec get_login_token(binary, binary) :: Token.t() | nil
  defp get_login_token(token, type \\ "login") do
    Token
    |> where([t], t.inserted_at >= datetime_add(^NaiveDateTime.utc_now(), -24, "hour"))
    |> where(token: ^token)
    |> where(type: ^type)
    |> Repo.all()
    |> List.first()
  end

  @spec create_token(binary, binary) :: {:ok, Token.t()} | {:error, Ecto.Changeset.t()}
  defp create_token(email, type)
       when type in ["login", "patient_login", "team_list", "patient_team_list"] do
    %Token{}
    |> Token.changeset(%{email: email, token: Stitch.Rand.token(64), type: type})
    |> Repo.insert()
  end

  @spec delete_user_tokens(binary) :: {integer, nil}
  defp delete_user_tokens(email) do
    Token
    |> where(email: ^email)
    |> Repo.delete_all()
  end
end
