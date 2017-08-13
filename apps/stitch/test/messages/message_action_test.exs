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
end
