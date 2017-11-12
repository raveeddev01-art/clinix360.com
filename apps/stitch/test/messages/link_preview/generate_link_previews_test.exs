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

  test "message with more than 5 links" do
    message = insert :message, text_content: """
    https://www.youtube.com/watch?v=3tmd-ClpJxA
    https://www.youtube.com/watch?v=uo14xGYwWd4
    https://www.youtube.com/watch?v=J_ub7Etch2U
    https://www.youtube.com/watch?v=OrSadmwmmAs
    https://www.youtube.com/watch?v=iKzRIweSBLA
    https://www.youtube.com/watch?v=PEGccV-NOm8
    """

    Stitch.Message.LinkPreview.generate_link_previews(message)

    message = Stitch.MessageQueries.get_by_id(message.id)
    assert message.link_previews_generated
    assert message.link_previews == []
  end

  test "message with an invalid link" do
    message = insert(:message, text_content: "lorem https://foo.com ipsum")

    Stitch.Message.LinkPreview.generate_link_previews(message)

    message = Stitch.MessageQueries.get_by_id(message.id)
    assert message.link_previews_generated
    assert message.link_previews == []
  end

  test "message with a link without OG metadata" do
    message = insert(:message, text_content: "lorem http://www.erlang.org/ ipsum")

    Stitch.Message.LinkPreview.generate_link_previews(message)

    message = Stitch.MessageQueries.get_by_id(message.id)
    assert message.link_previews_generated
    assert message.link_previews == []
  end
end
