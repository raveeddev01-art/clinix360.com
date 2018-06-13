defmodule Stitch.Web.Api.V1.VersionController do
  use Stitch.Web, :controller

  def index(conn, _) do
    json(conn, StitchWeb.version())
  end
end
