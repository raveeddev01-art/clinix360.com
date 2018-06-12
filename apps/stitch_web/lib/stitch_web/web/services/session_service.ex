defmodule Stitch.Web.SessionService do
  alias Stitch.{
    Accounts.User,
    Team,
    Web.UserSession
  }

  import Plug.Conn

  @spec add_user_session(Conn.t(), User.t()) :: Conn.t()
  def add_user_session(conn, user) do
    login_map = get_session(conn, :login_map) || %{}
    user_session = UserSession.new(user)
    login_map = Map.put(login_map, user.team_id, user_session)
    put_session(conn, :login_map, login_map)
  end

  @spec delete_user_session(Conn.t(), pos_integer) :: Conn.t()
  def delete_user_session(conn, team_id) do
    login_map = get_session(conn, :login_map) || %{}
    login_map = Map.delete(login_map, team_id)
    put_session(conn, :login_map, login_map)
  end

  @spec get_user_session_token(Conn.t()) :: String.t() | nil
  def get_user_session_token(conn) do
    with {:ok, %{user_session: %UserSession{} = user_session}} <- get_user_session(conn) do
      user_session.token
    else
      _ -> nil
    end
  end

  def get_user_token_from_team(conn, team_id) do
    with %{} = login_map <- get_session(conn, :login_map),
         {:ok, user_session} <- Map.fetch(login_map, team_id) do
      user_session.token
    else
      _ -> nil
    end
  end

  @spec lock_user_session(Conn.t()) :: Conn.t()
  def lock_user_session(conn), do: update_user_session(conn, &UserSession.lock/1)

  @spec unlock_user_session(Conn.t()) :: Conn.t()
  def unlock_user_session(conn), do: update_user_session(conn, &UserSession.unlock/1)

  @spec update_user_session_token(Conn.t(), User.t()) :: Conn.t()
  def update_user_session_token(conn, user) do
    update_user_session(conn, fn user_session -> UserSession.update_token(user_session, user) end)
  end

  @spec get_user_session_lock_status(Conn.t()) :: boolean | nil
  def get_user_session_lock_status(conn) do
    with {:ok, %{user_session: %UserSession{} = user_session}} <- get_user_session(conn) do
      user_session.locked
    else
      _ -> nil
    end
  end

  @spec get_user_session(Conn.t()) :: UserSession.t() | {:ok, map} | :error
  def get_user_session(conn) do
    with %Team{} = team <- Map.get(conn.assigns, :team),
         login_map = get_session(conn, :login_map) || %{},
         %UserSession{} = user_session <- Map.get(login_map, team.id) do
      {:ok, %{user_session: user_session, team: team, login_map: login_map}}
    else
      _ -> :error
    end
  end

  @spec update_user_session(Conn.t(), (UserSession.t() -> UserSession.t())) :: Conn.t()
  def update_user_session(conn, update_fn) do
    with {:ok, %{user_session: user_session, login_map: login_map, team: team}} <-
           get_user_session(conn) do
      user_session = update_fn.(user_session)
      login_map = Map.put(login_map, team.id, user_session)
      put_session(conn, :login_map, login_map)
    else
      _ -> conn
    end
  end
end
