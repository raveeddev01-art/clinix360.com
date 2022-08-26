defmodule Stitch.Web.Plug.ApiAuthenticate do
  import Plug.Conn
  alias Stitch.UserQueries
  alias Stitch.Accounts.User

  def init(default), do: default

  def call(conn, opts) do
    conn = fetch_query_params(conn)

    with token when is_binary(token) <-
           parse_authentication_token(conn) |> IO.inspect(label: "here is api token"),
         %User{} = user <- UserQueries.get_active_by_token(token) do
      conn
      |> authenticate_user(user, opts)
    else
      nil ->
        conn
        |> put_status(:forbidden)
        |> Phoenix.Controller.json(%{message: "You are not authorized to access this resource."})
        |> halt
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
      |> put_status(:forbidden)
      |> Phoenix.Controller.json(%{message: "You are not authorized to access this resource."})
      |> halt
    end
  end

  defp parse_authentication_token(conn) do
    List.keyfind(conn.req_headers, "authorization", 0)
    |> case do
      {_, token} ->
        token

      nil ->
        List.keyfind(conn.req_cookies, "authorization", 0)
        |> case do
          nil -> nil
          {_, token} -> token
        end
    end
  end
end
