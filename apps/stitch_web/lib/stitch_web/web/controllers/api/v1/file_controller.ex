defmodule Stitch.Web.Api.V1.FileController do
  use Stitch.Web, :controller
  alias Stitch.{Repo, Group, MessageQueries, AWS.S3}

  action_fallback(Stitch.Web.Api.V1.FallbackController)

  plug(:parse_query_params when action in [:index])

  def index(conn, _params) do
    current_user = conn.assigns.current_user
    files = Stitch.Files.FileQueries.for_user(current_user, conn.assigns.query_options)
    render(conn, "index.json", files: files)
  end

  def parse_query_params(conn, _opts) do
    types = %{
      creator_id: :integer,
      filetype: :string
    }

    changeset = Ecto.Changeset.cast({%{}, types}, conn.params, Map.keys(types))
    assign(conn, :query_options, changeset.changes)
  end
end
