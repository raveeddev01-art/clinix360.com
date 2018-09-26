defmodule Stitch.Web.Admin.InternalAnalyticsController do
  use Stitch.Web, :controller
  alias Stitch.Web.Endpoint
  alias Stitch.Web.SubdomainRouter.Helpers, as: Routes
  alias Stitch.{TeamQueries, UserQueries}

  def retention_data(conn, _params) do
    data = Stitch.Analytics.CohortAnalysis.stat()
    conn |> json(data)
  end
end
