defmodule StitchConnect.Web.ErrorView do
  use StitchConnect.Web, :view

  def render("404.html", _assigns) do
    "Page not found"
  end

  def render("500.html", _assigns) do
    "Internal server error"
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
    render "500.html", assigns
  end
end
