defmodule Stitch.MessageCreationTest do
  use Stitch.DataCase
  alias Stitch.Message

  setup :create_user_and_group

  describe "&Message.create/3" do
    test "creates message with given group, user, and content", %{group: group, user: user} do
      assert {:ok, %{message: message}} = Message.create(group.id, user, %{"text_content" => "Hello, World!"})
      assert message.text_content == "Hello, World!"
    end
  end

  defp create_user_and_group(_) do
    user = insert(:user)
    group = insert(:group)
    insert(:group_user, user: user, group: group)

    {:ok, user: user, group: group}
  end
end
