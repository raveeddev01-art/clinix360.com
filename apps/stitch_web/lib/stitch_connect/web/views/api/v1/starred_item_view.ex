defmodule StitchConnect.Web.Api.V1.StarredItemView do
  use Stitch.Web, :view

  alias Stitch.{
    Files.Upload,
    Message,
    MessageAction,
    Paginator,
    Web.Endpoint,
    Web.Api.V1.FileView
  }

  alias StitchConnect.{
    Web.Api.V1.MessageView
  }

  def render("index.json", %{paginated_result: %Paginator{data: data, meta: meta}}) do
    files_url = Endpoint.files_struct_url()
    data = Enum.map(data, &render_starred_item(&1, files_url))
    %{data: data, meta: meta}
  end

  def render_starred_item(%MessageAction{upload: %Upload{} = upload}, _files_url) do
    FileView.file(upload)
  end

  def render_starred_item(%MessageAction{message: %Message{} = message}, files_url) do
    MessageView.message_json(message, true, files_url)
  end
end
