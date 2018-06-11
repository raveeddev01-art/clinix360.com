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

  @spec get_user_session_token(Conn.t()) :: Conn.t()
  def get_user_session_token(conn) do
    with %Team{} = team <- Map.get(conn.assigns, :team),
         login_map = get_session(conn, :login_map) || %{},
         %UserSession{} = user_session <- Map.get(login_map, team.id) do
      user_session.token
    else
      _ -> nil
    end
  end
end
