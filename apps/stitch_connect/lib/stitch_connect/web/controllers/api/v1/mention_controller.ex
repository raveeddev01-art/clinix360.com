defmodule StitchConnect.Web.Api.V1.MentionController do
  use StitchConnect.Web, :controller

  plug StitchConnect.Plug.ApiAuthenticate

  def index(conn, params) do
    pagination_opts = parse_pagination_params(params, [:limit, :skip])
    paginated_result = Stitch.MessageQueries.user_mentioned_in(conn.assigns.current_user, pagination_opts)

    render(conn, "index.json", mentions: paginated_result)
  end
end
