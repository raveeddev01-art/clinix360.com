defmodule StitchConnect.Web.Api.V1.StarredMessageView do
  use Stitch.Web, :view
  alias StitchConnect.Web.Api.V1.MessageView
  alias Stitch.Web.Api.V1.MessagesHelper

  alias Stitch.{
    Files.Upload
  }

  @endpoint Stitch.Web.Endpoint

  def render("index.json", %{starred_messages: starred_messages}) do
    Enum.map(starred_messages, &starred_message_json/1)
  end

  def starred_message_json(starred_item) do
    %{
      id: starred_item.id,
      text_content: starred_item.text_content,
      user: MessageView.user_info(starred_item),
      inserted_at: starred_item.inserted_at,
      group_id: starred_item.group_id,
      fields: starred_item_fields(starred_item),
      type: starred_item.type
    }
  end

  def starred_item_fields(%Upload{} = upload), do: Upload.fields(upload)
  def starred_item_fields(message) do
    if message.upload != nil do
      MessagesHelper.render_fields(message, true, @endpoint.files_struct_url())
    else
      nil
    end
  end
  def starred_item_fields(_upload), do: nil
end
