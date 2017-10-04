defmodule StitchConnect.Web.Api.V1.MentionView do
  use StitchConnect.Web, :view

  def render("index.json", %{mentions: %Stitch.Paginator{data: data, meta: meta}}) do
    %{
      data: Enum.map(data, &render_message/1),
      meta: meta
    }
  end

  def render_message(message) do
    %{
      id: message.id,
      text_content: message.text_content,
      user: StitchConnect.Web.Api.V1.MessageView.user_info(message),
      inserted_at: message.inserted_at,
      group_id: message.group_id
    }
  end
end
