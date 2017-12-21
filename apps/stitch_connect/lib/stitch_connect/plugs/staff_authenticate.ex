defmodule StitchConnect.Plug.StaffAuthenticate do
  import Plug.Conn
  alias Stitch.Accounts
  alias Stitch.Accounts.User

  def init(_), do: nil

  def call(conn, _) do
   conn
   |> get_user_id()
   |> do_auth(conn)
  end

  def get_user_id(conn) do
    get_session(conn, :impersonator_user_id) || get_session(conn, :current_user_id)
  end

  @refactor """
  abstract the role authorization to a module/function
  so the codebase is not coupled to invidivual boolean role fields.
  This will allow the role system to grow in the future when
  one-to-many user to roles is desired. For example, the staff check
  below could be written as:

      with %User{} = user = <- Accounts.get_by_id(user_id),
           :ok <- StaffAuthorizer.authorize(user, :signin) do

        user -> assign(conn, :current_user, user)
      else
        nil -> halt_unauthorized(conn)
        {:error, :unauthorized} ->  halt_forbidden(conn)
      end
  """

  @refactor """
  Favor explicit match on what consittues a staff user (
  in this case `is_staff: true`). In the match below,
  the `user` fallthrough case is assumed to be a staff user, but
  for example, `%User{is_staff: nil}` would allow a user through as a
  staff member.
  """
  defp do_auth(nil, conn), do: unauthorized(conn)
  defp do_auth(user_id, conn) do
    case Accounts.get_by_id(user_id) do
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
