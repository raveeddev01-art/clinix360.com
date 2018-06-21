defmodule Stitch.Message.LinkPreview.DeleteTest do
  use Stitch.DataCase
  alias Stitch.{Message, Repo, Engage.ConversationMessage}

  test "deletes a link on a message" do
    message =
      insert(
        :message,
        link_previews: [
          %{link: "http://foo.com", title: "Foo"},
          %{link: "http://bar.com", title: "Bar"}
        ]
      )

    message_with_deleted_link_preview = Message.LinkPreview.delete!(message, "http://foo.com")

    assert message_with_deleted_link_preview.id == message.id

    assert [%{link: "http://bar.com", title: "Bar"}] =
             message_with_deleted_link_preview.link_previews

    message_with_deleted_link_preview = Repo.get!(Message, message.id)

    assert [%{link: "http://bar.com", title: "Bar"}] =
             message_with_deleted_link_preview.link_previews
  end

  test "deletes a link on a conversation_message" do
    conversation_message =
      insert(
        :conversation_message,
        link_previews: [
          %{link: "http://baz.com", title: "Baz"},
          %{link: "http://qux.com", title: "Qux"}
        ]
      )

    conversation_message_with_deleted_link_preview =
      Message.LinkPreview.delete!(conversation_message, "http://baz.com")

    assert conversation_message_with_deleted_link_preview.id == conversation_message.id

    assert [%{link: "http://qux.com", title: "Qux"}] =
             conversation_message_with_deleted_link_preview.link_previews

    conversation_message_with_deleted_link_preview =
      Repo.get!(ConversationMessage, conversation_message.id)

    assert [%{link: "http://qux.com", title: "Qux"}] =
             conversation_message_with_deleted_link_preview.link_previews
  end
end
