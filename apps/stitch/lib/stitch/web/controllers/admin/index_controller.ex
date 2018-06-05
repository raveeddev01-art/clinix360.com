defmodule Stitch.Web.Admin.IndexController do
  use Stitch.Web, :controller

  def index(conn, _) do
    conn
    |> put_status(:ok)
    |> text("")
  end
end
