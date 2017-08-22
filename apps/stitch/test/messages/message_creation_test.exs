defmodule Stitch.MessageCreationTest do
  use Stitch.TestCase
  alias Stitch.Message

  describe "&Message.create/3" do
    test "creates message with given group, user, and content" do
      user = insert(:user)
      group = insert(:group)
      insert(:group_user, user: user, group: group)

      assert {:ok, message} = Message.create(group.id, user.id, %{"text_content" => "Hello, World!"})
      assert message.text_content == "Hello, World!"
    end
  end
end
