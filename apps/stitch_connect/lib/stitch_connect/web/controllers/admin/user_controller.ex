defmodule StitchConnect.Web.Admin.UserController do
  use StitchConnect.Web, :controller
  alias Stitch.Accounts.User
  alias Stitch.Paginator

  def index(conn, %{"page" => page, "limit" => limit}) do
    limit = String.to_integer(limit)
    page = String.to_integer(page)
    skip = (page - 1) * limit
    %{data: users, meta: meta} = Paginator.new(User, skip: skip, limit: limit)
    render(conn, "index.html", users: users, meta: meta)
  end
  def index(conn, _params) do
    %{data: users, meta: meta} = Paginator.new(User, [])
    render(conn, "index.html", users: users, meta: meta)
  end
end
