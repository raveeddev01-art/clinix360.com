defmodule Stitch.Message.LinkPreview.GenerateLinkPreviewsTest do
  use Stitch.DataCase

  test "message with a link with OG metadata" do
    message = insert(:message, text_content: "lorem https://reactjs.org ipsum")

    Stitch.Message.LinkPreview.generate_link_previews(message)

    message = Stitch.MessageQueries.get_by_id(message.id)
    assert message.link_previews_generated
    assert [link_preview] = message.link_previews
    assert link_preview.link == "https://reactjs.org"
    assert link_preview.title == "React - A JavaScript library for building user interfaces"
    assert link_preview.description == "A JavaScript library for building user interfaces"
    assert link_preview.image_url == "https://reactjs.org/logo-og.png"
  end
end
