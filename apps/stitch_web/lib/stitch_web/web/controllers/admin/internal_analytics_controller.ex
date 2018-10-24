defmodule Stitch.Web.Admin.InternalAnalyticsController do
  use Stitch.Web, :controller
  alias Stitch.Web.Endpoint
  alias Stitch.Web.SubdomainRouter.Helpers, as: Routes

  alias Stitch.{
    TeamQueries,
    UserQueries,
    Analytics.CohortAnalysis,
    Analytics.CohortAnalysisWithFilter,
    Analytics.CohortAnalysisForUsers
  }

  plug(
    :parse_query_params
    when action in [
           :retention_data,
           :retention_data_with_team_filter,
           :internal_analytics_teams_info,
           :retention_data_for_users
         ]
  )

  def retention_data(conn, params) do
    data = CohortAnalysis.stat(conn.assigns.query_options)
    conn |> json(data)
  end

  def retention_data_with_team_filter(conn, params) do
    data = CohortAnalysisWithFilter.stat(conn.assigns.query_options)
    conn |> json(data)
  end

  def internal_analytics_teams_info(conn, params) do
    data = Stitch.Analytics.CohortAnalysisTeams.teams_info(conn.assigns.query_options)
    conn |> json(data)
  end

  def retention_data_for_users(conn, params) do
    data = Stitch.Analytics.CohortAnalysisForUsers.stat(conn.assigns.query_options)
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
