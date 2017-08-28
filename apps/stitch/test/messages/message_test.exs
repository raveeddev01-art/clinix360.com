defmodule Stitch.MessageTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  test "Stitch.Message.update/2" do
    message = insert(:message)
    Stitch.Message.update(message, %{"text_content" => "new text content"})
    message = Stitch.MessageQueries.get_by_id(message.id)
    assert message.text_content == "new text content"
    assert message.edited_at != nil
  end
end
