defmodule Stitch.MessageCreationTest do
  use Stitch.DataCase
  alias Stitch.Message

  setup :create_user_and_group

  describe "&Message.create/3" do
    test "creates message with given group, user, and content", %{group: group, user: user} do
      assert {:ok, %{message: message}} = Message.create(group.id, user, %{"text_content" => "Hello, World!"})
      assert message.text_content == "Hello, World!"
    end

    test "checks for links", %{group: group, user: user} do
      {:ok, %{message: message}} = Message.create(group.id, user, %{"text_content" => "lorem"})
      refute message.has_links

      {:ok, %{message: message}} = Message.create(group.id, user, %{"text_content" => "http://foo.bar"})
      assert message.has_links
    end

    test "unhides groups on new message" do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      {:ok, group} = Stitch.Group.create_single_dm(bob, [bob.id, joe.id])
      Stitch.Group.hide(group.id, bob)
      {:ok, _} = Message.create(group.id, joe, %{"text_content" => "test"})
      assert Repo.get_by(Stitch.GroupUser, user_id: bob.id, group_id: group.id).is_hidden == false
    end
  end

  defp create_user_and_group(_) do
    team = insert(:team)
    user = insert(:user, team: team)
    group = insert(:group, team: team)
    insert(:group_user, user: user, group: group)

    {:ok, user: user, group: group}
  end
end
