defmodule Stitch.Web.Plug.FileAuthenticate do
  import Plug.Conn
  alias Stitch.UserQueries
  alias Stitch.Accounts.User

  def init(default), do: default

  def call(conn, _opts) do
    conn = fetch_query_params(conn)

    with token when is_binary(token) <- get_token_from_cookie_or_header(conn),
         %User{} = user <- UserQueries.get_active_by_token(token) do
      conn
      |> assign(:current_user, user)
    else
      nil ->
        conn
        |> Plug.Conn.put_session(:redirect_url, conn.request_path)
        |> Phoenix.Controller.redirect(external: login_url())
        |> halt
    end
  end

  def get_token_from_cookie_or_header(conn) do
    get_session(conn, :current_user_token) || conn.params["authenticationToken"]
  end

  def login_url do
    struct_url = Stitch.Web.Endpoint.struct_url()
    Stitch.Web.Router.Helpers.home_url(struct_url, :index)
  end
end
