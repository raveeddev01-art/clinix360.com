defmodule StitchConnect.Plug.StaffAuthenticate do
  import Plug.Conn
  alias Stitch.Accounts

  def init(_), do: nil

  def call(conn, _) do
   conn
   |> get_session(:current_user_id)
   |> do_auth(conn) 
  end

  defp do_auth(nil, conn), do: unauthorized(conn)
  defp do_auth(user_id, conn) do
    case Accounts.get_by_id(user_id) do
      nil -> unauthorized(conn)
      %{is_staff: false} ->
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
