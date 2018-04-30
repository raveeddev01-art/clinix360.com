defmodule StitchConnect.Web.Api.V1.NewsController do
  use StitchConnect.Web, :controller
  alias Stitch.{News, NewsQueries}

  action_fallback(StitchConnect.Web.Api.FallbackController)

  def index(conn, _params) do
    news = NewsQueries.all_news()
    render(conn, "index.json", news: news)
  end
end
