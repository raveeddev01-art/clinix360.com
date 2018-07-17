defmodule StitchConnect.Web.Api.V1.StarredItemController do
  use Stitch.Web, :controller

  alias Stitch.{
    StarrableItems.StarrableItemQueries
  }

  def index(conn, params) do
    current_user = conn.assigns.current_user
    pagination_opts = parse_pagination_params(params, [:limit, :skip])
    paginated_result = StarrableItemQueries.user_starred_items(current_user.id, pagination_opts)

    render(conn, "index.json", paginated_result)
  end
end
