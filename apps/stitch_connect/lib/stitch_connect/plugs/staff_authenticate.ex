defmodule StitchConnect.Plug.StaffAuthenticate do
  import Plug.Conn
  alias Stitch.UserQueries
  alias Stitch.Accounts.User

  def init(_), do: nil

  def call(conn, _) do
   conn
   |> get_user_token()
   |> do_auth(conn)
  end

  def get_user_token(conn) do
    get_session(conn, :impersonator_user_token) || get_session(conn, :current_user_token)
  end

  defp do_auth(nil, conn), do: unauthorized(conn)
  defp do_auth(user_token, conn) do
    case UserQueries.get_active_by_token(user_token) do
      nil -> unauthorized(conn)
      %User{is_staff: false} ->
        conn
        |> send_resp(403, "Forbidden")
        |> halt()
      user -> assign(conn, :current_user, user)
    end
  end

  defp unauthorized(conn) do
    conn
    |> send_resp(401, "Unauthorized")
    |> halt()
  end
end
