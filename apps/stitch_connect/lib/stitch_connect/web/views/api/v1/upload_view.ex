defmodule StitchConnect.Web.Api.V1.UploadView do
  alias Stitch.Paginator
  use StitchConnect.Web, :view
  alias StitchConnect.Web.Api.V1.MessageView

  def render("index.json", %{uploads: %Paginator{data: data, meta: meta}, user_id: user_id}) do
    %{data: Enum.map(data, &MessageView.message_json/1), meta: meta}
  end

  def render("create.json", %{signature: signature}) do
    signature
  end
end