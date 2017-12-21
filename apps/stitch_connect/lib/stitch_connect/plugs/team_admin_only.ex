defmodule StitchConnect.Plug.TeamAdminOnly do
  import Plug.Conn

  def init(default), do: default

  @refactor """
  Role verification should be pushed into a separate mod/function rather than
  using Enum.member? directly. This allows the role system to grow into the
  future without large refactoring. It also gives a place for specialized
  authorization logic to live, such as what conditions a team admin can
  signin, rather than the opaque check here.

  For example:

      case TeamAdminAuthorizer.authorize(user, :signin) do
        :ok -> conn
        {:error, :unauthorized} ->
          conn
          |> put_status(:unauthorized)
          |> Phoenix.Controller.json(%{message: "Only team administrators can access this."})
          |> halt()
      end
  """

  @refactor """
  no need to dup call to fetch_query_params here. Pipelines
  takes care of it. If added here for convenience for test suite,
  look at `Phoenix.ConnTest.bypass_through/3`
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
