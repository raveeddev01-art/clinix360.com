defmodule StitchConnect.Plug.ApiAuthenticate do
  import Plug.Conn

  def init(default), do: default

  def call(conn, opts) do
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
        conn
        |> authenticate_user(user, opts)
    end
  end

  defp authenticate_user(conn, user, opts) do
    if opts[:without_team_subdomain] == true do
      conn
      |> assign(:current_user, user)
    else
      conn
      |> authenticate_for_team_subdomain(user)
    end
  end

  defp authenticate_for_team_subdomain(conn, user) do
    if user.team_id == conn.assigns.team.id do
      conn
      |> assign(:current_user, user)
    else
      conn
      |> put_status(:unauthorized)
      |> Phoenix.Controller.json(%{message: "You are not authorized to access this resource."})
      |> halt
    end
  end
end
