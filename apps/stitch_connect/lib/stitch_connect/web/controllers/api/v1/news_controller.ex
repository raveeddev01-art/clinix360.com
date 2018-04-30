defmodule StitchConnect.Web.Api.V1.NewsController do
  use StitchConnect.Web, :controller
  alias Stitch.{News, NewsQueries}

  action_fallback(StitchConnect.Web.Api.FallbackController)

  def index(conn, _params) do
    news = NewsQueries.all_news()
    render(conn, "index.json", news: news)
  end

  def mark_as_read(conn, _params) do
    {:ok, user} = News.mark_user_as_read(conn.assigns.current_user)

    conn
    |> json(%{whats_new_last_seen_at: user.whats_new_last_seen_at})
  end
end
