defmodule StitchConnect.Web.Api.V1.VersionController do
  use StitchConnect.Web, :controller

  def index(conn, _) do
    json(conn, StitchConnect.version)
  end
end
