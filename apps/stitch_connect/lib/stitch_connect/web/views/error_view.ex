defmodule StitchConnect.Web.ErrorView do
  use StitchConnect.Web, :view
  alias StitchConnect.Web.{HomeView, LayoutView}

  def render("404.html", assigns) do
    render_options = Dict.merge(
      assigns,
      layout: {LayoutView, "home_layout.html"},
      conn: browser_pipeline_equivalent(assigns.conn)
    )

    render(HomeView, "index.html", render_options)
  end

  defp browser_pipeline_equivalent (conn) do
    # conn needs session & flash values in order to render properly
    # but ErrorView logic bypasses router by Phoenix conventions, so
    # adding the equivalent of the browser pipeline here
    conn
    |> Phoenix.Controller.accepts(["html"])
    |> Plug.Conn.fetch_session()
    |> Phoenix.Controller.fetch_flash()
    |> Phoenix.Controller.protect_from_forgery()
    |> Phoenix.Controller.put_secure_browser_headers()
  end

  def render("500.html", assigns) do
    render("error.html", assigns)
  end

  def render("403.json", %{message: message}) do
    %{message: message}
  end

  def render("403.json", _assigns) do
    %{message: "You are not authorized to access this resource."}
  end

  def render("404.json", %{message: message}) do
    %{errors: message}
  end

  def render("404.json", _assigns) do
    %{errors: "The resource you are looking for does not exist."}
  end

  def render("422.json", %{errors: errors}) do
    %{errors: errors}
  end

  def render("422.json", %{message: message}) do
    %{message: message}
  end

  # In case no render clause matches or no
  # template is found, let's render it as 500
  def template_not_found(_template, assigns) do
    render("500.html", assigns)
  end
end
