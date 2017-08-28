defmodule Stitch.MessageQueriesTest do
  use Stitch.DataCase, async: true

  test "Stitch.MessageQueries.user_starred_messages/1" do
    user = insert(:user)
    message = insert(:message)
    {:ok, true, _message_action} = Stitch.MessageAction.toggle_star(message, user)
    _unstarred_message = insert(:message)

    starred_message_ids =
      Stitch.MessageQueries.user_starred_messages(user.id)
      |> Enum.map(& &1.id)

    assert starred_message_ids == [message.id]
  end
end
