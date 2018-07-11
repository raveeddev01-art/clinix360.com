defmodule StitchConnect.Web.Api.V1.AppView do
  use Stitch.Web, :view

  def render("index.json", %{apps: apps}) do
    Enum.map(apps, &app_json/1)
  end

  def app_json(app) do
    %{
      id: app.id,
      name: app.name,
      slug: app.slug,
      icon_url: app.icon_url,
      description: app.description
    }
  end
end
