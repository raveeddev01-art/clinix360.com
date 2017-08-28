defmodule StitchConnect.Web.Api.V1.UploadView do
  use StitchConnect.Web, :view

  def render("index.json", %{uploads: uploads}) do
    %{uploads: uploads}
  end

  def render("create.json", %{signature: signature}) do
    signature
  end
end