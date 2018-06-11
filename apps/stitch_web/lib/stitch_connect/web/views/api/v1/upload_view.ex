defmodule StitchConnect.Web.Api.V1.UploadView do
  alias Stitch.Paginator
  use Stitch.Web, :view
  alias StitchConnect.Web.Api.V1.MessageView

  def render("index.json", %{uploads: %Paginator{data: data, meta: meta}} = opts) do
    authenticated_urls = Map.get(opts, :authenticated_urls, false)
    files_url = Stitch.Web.Endpoint.files_struct_url()

    data =
      Enum.map(data, fn message ->
        MessageView.message_json(message, authenticated_urls, files_url)
      end)

    %{data: data, meta: meta}
  end

  def render("create.json", %{signature: signature}) do
    signature
  end
end
