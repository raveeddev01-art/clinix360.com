defmodule StitchConnect.Web.Api.V1.UploadSignatureView do
  use StitchConnect.Web, :view

  def render("create.json", %{signature: signature}) do
    signature
  end
end