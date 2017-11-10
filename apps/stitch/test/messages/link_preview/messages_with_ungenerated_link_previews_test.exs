defmodule Stitch.Message.LinkPreview.MessagesWithUngeneratedLinkPreviewsTest do
  use Stitch.DataCase, async: true

  test "returns messages that have links and ungenerated link previews" do
    message = insert(:message, has_links: true, link_previews_generated: false)
    insert(:message, has_links: false, link_previews_generated: false)
    insert(:message, has_links: false, link_previews_generated: true)
    insert(:message, has_links: true, link_previews_generated: true)

    message_ids =
      Stitch.Message.LinkPreview.messages_with_ungenerated_link_previews
      |> Enum.map(& &1.id)

    assert message_ids == [message.id]
  end
end
