defmodule StitchConnect.Plug.TeamAdminOnly do
  import Plug.Conn

  def init(default), do: default

  def call(conn, _) do
    conn = fetch_query_params(conn)
    case Stitch.UserQueries.get_by_token(conn.params["authenticationToken"]) do
      {:error, message} ->
        conn
        |> put_status(:unauthorized)
        |> Phoenix.Controller.json(%{message: message})
        |> halt
      {:not_found, message} ->
        conn
        |> put_status(:unauthorized)
        |> Phoenix.Controller.json(%{message: message})
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