defmodule StitchConnect.Plug.TeamAdminOnly do
  import Plug.Conn

  def init(default), do: default

  def call(conn, _) do
    conn = fetch_query_params(conn)
    case Stitch.UserQueries.get_active_by_token(conn.params["authenticationToken"]) do
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
end
