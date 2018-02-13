defmodule Stitch.FindYourTeam do
  import Ecto.Query

  alias Stitch.Repo
  alias Stitch.{FindYourTeam.Token, Team, Accounts.User, UserQueries}
  alias Ecto.Multi

  @doc """
  Creates a "team_list" token allowing a user to obtain "login" token (after visiting the page).
  Previously used find-you-team tokens, if any, are deleted upon the creation.
  """
  @spec create_team_list_token(binary) :: {:ok, Token.t} | {:error, binary} | {:error, Ecto.Changeset.t}
  def create_team_list_token(email) do
    if Stitch.UserQueries.user_with_email_exists?(email) do
      delete_user_tokens(email)
      create_token(email, "team_list")
    else
      {:error, "Not found"}
    end
  end

  @doc """
  Given a "team-list" token, removes it and creates a login token that allows
  the user to login to any of their teams.
  """
  @spec create_login_token(binary) :: {:ok, %{login_token: Token.t}} | {:error, term}
  def create_login_token(token) do
    Multi.new
    |> Multi.delete_all(:delete_team_list_token, get_team_list_token(token), [returning: true])
    |> Multi.run(:login_token, Stitch.FindYourTeam, :login_token, [])
    |> Repo.transaction
  end

  @doc """
  Finds the corresponding user for the given team and the find-your-team "login" token.
  Removes the token and returns the user.
  """
  @spec activate_login_token(Team.t, binary) :: {:ok, User.t} | {:error, term}
  def activate_login_token(%Team{} = team, token) do
    with %Token{} = token <- get_login_token(token),
         %User{} = user <- UserQueries.team_member_with_email(team.id, token.email) do
      delete_user_tokens(user.email)
      {:ok, user}
    else
      _e -> {:error, "Error activating the token"}
    end
  end

  @spec login_token(map) :: {:ok, Token.t} | {:error, Ecto.Changeset.t}
  def login_token(%{delete_team_list_token: {1, [token]}}) do
    create_token(token.email, "login")
  end

  def login_token(%{delete_team_list_token: {0, []}}) do
    {:error, "Not found"}
  end

  @spec get_team_list_token(binary) :: Ecto.Queryable.t
  defp get_team_list_token(token) do
    Token
    |> where([t], t.inserted_at >= datetime_add(^NaiveDateTime.utc_now, -24, "hour"))
    |> where(token: ^token)
    |> where(type: "team_list")
  end

  @spec get_login_token(binary) :: Token.t | nil
  defp get_login_token(token) do
    Token
    |> where([t], t.inserted_at >= datetime_add(^NaiveDateTime.utc_now, -24, "hour"))
    |> where(token: ^token)
    |> where(type: "login")
    |> Repo.all
    |> List.first
  end

  @spec create_token(binary, binary) :: {:ok, Token.t} | {:error, Ecto.Changeset.t}
  defp create_token(email, type) when type in ["login", "team_list"] do
    %Token{}
    |> Token.changeset(%{email: email, token: Stitch.Rand.token(64), type: type})
    |> Repo.insert
  end

  @spec delete_user_tokens(binary) :: {integer, nil}
  defp delete_user_tokens(email) do
    Token
    |> where(email: ^email)
    |> Repo.delete_all
  end
end
