defmodule Stitch.Web.Api.V1.ContactView do
  use Stitch.Web, :view

  def render("success.json", _) do
    %{
      "success" => true
    }
  end
end
