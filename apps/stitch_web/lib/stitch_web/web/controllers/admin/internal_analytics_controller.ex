defmodule Stitch.Web.Admin.InternalAnalyticsController do
  use Stitch.Web, :controller
  alias Stitch.Web.Endpoint
  alias Stitch.Web.SubdomainRouter.Helpers, as: Routes
  alias Stitch.{TeamQueries, UserQueries, Analytics.CohortAnalysis}

  plug(:parse_query_params when action in [:retention_data])

  def retention_data(conn, params) do
    data = CohortAnalysis.stat(conn.assigns.query_options)
    conn |> json(data)
  end

  def parse_query_params(conn, _opts) do
    types = %{
      messages_threshold: :integer
    }

    changeset = Ecto.Changeset.cast({%{}, types}, conn.params, Map.keys(types))
    assign(conn, :query_options, changeset.changes)
  end
end
