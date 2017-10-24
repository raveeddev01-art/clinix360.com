defmodule StitchConnect.Web.Api.V1.PinnedMessageView do
  use StitchConnect.Web, :view

  def render("index.json", %{pinned_messages: %Stitch.Paginator{data: data, meta: meta}}) do
    %{
      data: Enum.map(data, & StitchConnect.Web.Api.V1.MessageView.message_json/1),
      meta: meta
    }
  end
end
