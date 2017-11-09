defmodule Stitch.Message.UpdateTest do
  use Stitch.DataCase, async: true
  alias Stitch.Message

  test "checks for links" do
    message = insert(:message)
    {:ok, message} = Message.update(message, %{"text_content" => "http://foo.bar"})
    assert message.has_links
  end
end
