defmodule Stitch.MessageActionTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.MessageAction.toggle_star/2" do
    test "returns true if message has been starred" do
      message = insert(:message)
      assert {:ok, true, _message_action} = Stitch.MessageAction.toggle_star(message, message.user)
      refute Stitch.MessageAction.get_star(message, message.user) == nil
    end

    test "returns false if message has been unstarred" do
      message = insert(:message)
      assert {:ok, true, _message_action} = Stitch.MessageAction.toggle_star(message, message.user)
      assert {:ok, false, _message_action} = Stitch.MessageAction.toggle_star(message, message.user)
      assert Stitch.MessageAction.get_star(message, message.user) == nil
    end
  end

  describe "Stitch.MessageAction.apply_message_actions/2" do
    test "returns list of messages with applied user actions" do
      user = insert(:user)
      group = insert(:group)
      message_bar = insert(:message, user: user, group: group, text_content: "bar")
      message_baz = insert(:message, user: user, group: group, text_content: "baz")
      message_qux = insert(:message, user: user, group: group, text_content: "qux")

      assert {:ok, true, _message_action} = Stitch.MessageAction.toggle_star(message_bar, user)
      assert {:ok, true, _message_action} = Stitch.MessageAction.toggle_star(message_qux, user)

      messages = Stitch.MessageQueries.group_latest_messages(group.id)
      messages = Stitch.MessageAction.apply_user_message_actions(user, messages) |> Enum.sort_by(& &1.id)

      assert [
        %{text_content: "bar", starred: true},
        %{text_content: "baz"},
        %{text_content: "qux", starred: true}
      ] = messages
    end
  end
end
