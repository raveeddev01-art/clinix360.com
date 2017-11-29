defmodule Stitch.Message.LinkPreview.DeleteTest do
  use Stitch.DataCase
  alias Stitch.{Message, Repo}

  test "deletes a link" do
    message = insert :message, link_previews: [
      %{link: "http://foo.com", title: "Foo"},
      %{link: "http://bar.com", title: "Bar"},
    ]

    message_with_deleted_link_preview = Message.LinkPreview.delete!(message, "http://foo.com")

    assert message_with_deleted_link_preview.id == message.id
    assert [%{link: "http://bar.com", title: "Bar"}] =
      message_with_deleted_link_preview.link_previews

    message_with_deleted_link_preview = Repo.get!(Message, message.id)
    assert [%{link: "http://bar.com", title: "Bar"}] =
      message_with_deleted_link_preview.link_previews
  end
end
