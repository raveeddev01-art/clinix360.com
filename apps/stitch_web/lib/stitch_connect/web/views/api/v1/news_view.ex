defmodule StitchConnect.Web.Api.V1.NewsView do
  use Stitch.Web, :view

  def render("index.json", %{news: news} = attrs) do
    Enum.map(news, &news_json/1)
  end

  def news_json(news) do
    %{
      id: news.id,
      inserted_at: news.inserted_at,
      title: news.title,
      html_body: news.html_body,
      permalink: news.permalink
    }
  end
end
