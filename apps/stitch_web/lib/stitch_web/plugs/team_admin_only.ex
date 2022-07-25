defmodule Stitch.Web.Plug.TeamAdminOnly do
  import Plug.Conn

  def init(default), do: default

  def call(conn, _) do
    conn = fetch_query_params(conn)

    parse_authentication_token(conn)
    |> Stitch.UserQueries.get_active_by_token()
    |> case do
      nil ->
        conn
        |> put_status(:forbidden)
        |> Phoenix.Controller.json(%{message: "You are not authorized to access this resource."})
        |> halt

      user ->
        case Enum.member?(user.roles, "admin") do
          false ->
            conn
            |> put_status(:unauthorized)
            |> Phoenix.Controller.json(%{message: "Only team administrators can access this."})
            |> halt

          true ->
            conn
        end
    end
  end

  defp parse_authentication_token(conn) do
    List.keyfind(conn.req_headers, "x-auth-token", 0)
    |> case do
      {_, token} -> token
      nil -> nil
    end
  end
end
