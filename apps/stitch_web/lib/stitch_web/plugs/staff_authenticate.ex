defmodule Stitch.Web.Plug.StaffAuthenticate do
  use Stitch.Web, :plug
  alias Stitch.UserQueries
  alias Stitch.Accounts.User

  def init(_), do: nil

  def call(conn, _) do
    do_auth(conn)
  end

  def do_auth(conn) do
    case get_staff_member(conn) do
      nil ->
        unauthorized(conn)

      user ->
        assign(conn, :current_user, user)
    end
  end

  defp unauthorized(conn) do
    conn
    |> send_resp(401, "Unauthorized")
    |> halt()
  end

  def get_staff_member(conn) do
    (get_session(conn, :login_map) || %{})
    |> Map.values()
    |> Enum.map(& &1.token)
    |> UserQueries.find_staff()
  end
end
