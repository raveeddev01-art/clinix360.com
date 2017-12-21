defmodule StitchConnect.Plug.ApiAuthenticate do
  import Plug.Conn

  def init(default), do: default

  @refactor """
  no need to dup call to fetch_query_params here. Pipelines
  takes care of it. If added here for convenience for test suite,
  look at `Phoenix.ConnTest.bypass_through/3`
  """

  @refactor """
  should pattern match on %User{} to ensure proper success case
  """
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
        conn
        |> assign(:current_user, user)
    end
  end
end
