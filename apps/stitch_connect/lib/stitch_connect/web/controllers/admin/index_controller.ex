defmodule StitchConnect.Web.Admin.IndexController do
  use StitchConnect.Web, :controller

  def index(conn, _) do
    conn
    |> put_status(:ok)
    |> text("")
  end
end
