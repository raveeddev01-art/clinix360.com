defmodule StitchConnect.Web.Api.V1.UserController do
  use StitchConnect.Web, :controller

  def create(conn, params) do
    render conn, "create.json"
  end
end
