defmodule Stitch.GroupTest do
  use Stitch.DataCase, async: true
  alias Stitch.{Group, GroupUser, GroupQueries}

  describe "Stitch.Group.changeset/2" do
    test "allows letters, numbers and dashes in names" do
      changeset = Group.changeset(%Group{}, %{name: "Emergency-Room 42"})
      assert changeset.errors[:name] == nil
    end

    test "doesn't allow puncuation marks in name" do
      changeset = Group.changeset(%Group{}, %{name: "General."})
      assert {"has invalid format", [validation: :format]} = changeset.errors[:name]
    end

    test "generates a slug from the name if a slug isn't provided" do
      changeset = Group.changeset(%Group{}, %{name: "General"})
      assert changeset.changes.slug == "general"
    end

    test "requires `name` as a change" do
      changeset = Group.changeset(%Group{}, %{})
      assert hd(errors_on(changeset).name) =~ "blank"
    end
  end

  describe "Stitch.Group.rename/2" do
    test "it renames the group" do
      group = insert(:group, %{name: "Example"})
      {:ok, group} = Group.rename(group, "Deploy")
      assert group.name == "Deploy"
      assert group.slug == "deploy"
      assert Enum.count(group.users) == 0
    end

    test "it returns error for blank string" do
      group = %Group{}
      {:error, reason} = Group.rename(group, "")
      assert reason == "Name cannot be blank or nil"
    end

    test "it return error for nil name" do
      group = %Group{}
      {:error, reason} = Group.rename(group, nil)
      assert reason == "Name cannot be blank or nil"
    end

    test "does not rename a single DM group" do
      group = %Group{name: "__dm_group__"}
      {:error, reason} = Group.rename(group, "Foo")
      assert reason == "Direct messages can't be renamed"
    end

    test "does not rename a multi DM group" do
      group = %Group{name: "__multi_dm_group__"}
      {:error, reason} = Group.rename(group, "Foo")
      assert reason == "Direct messages can't be renamed"
    end
  end

  describe "Stitch.Group.toggle_favorite/2" do
    test "returns error if user isn't member of group" do
      group = insert(:group)
      user = insert(:user)
      assert {:error, error} = Group.toggle_favorite(group.id, user.id)
      assert error == "User has to be member of room to favorite it."
    end

    test "it favorites new groups for user" do
      group = insert(:group)
      user = insert(:user)
      insert(:group_user, group: group, user: user)

      assert {:ok, %{is_favorite: true}} = Group.toggle_favorite(group.id, user.id)
    end

    test "it unfavorites favorited group for user" do
      group = insert(:group)
      user = insert(:user)
      insert(:group_user, group: group, user: user)
      Group.toggle_favorite(group.id, user.id)

      assert {:ok, %{is_favorite: false}} = Group.toggle_favorite(group.id, user.id)
    end
  end

  describe "Stitch.Group.toggle_public/2" do
    test "it sets public to true" do
      group = insert(:group, %{public: false})
      {:ok, group} = Group.toggle_public(group, true)
      assert group.public == true
    end

    test "it sets public to false" do
      group = insert(:group, %{public: true})
      {:ok, group} = Group.toggle_public(group, false)
      assert group.public == false
    end

    test "does not change single DM groups" do
      group = %Group{name: "__dm_group__"}
      assert {:error, :direct_message} = Group.toggle_public(group, false)
    end

    test "does not change multi DM groups" do
      group = %Group{name: "__multi_dm_group__"}
      assert {:error, :direct_message} = Group.toggle_public(group, false)
    end

    test "does not change the default group" do
      group = %Group{name: "General", is_default: true}
      assert {:error, :default_group} = Group.toggle_public(group, false)
    end
  end

  describe "Stitch.Group.add_user/2" do
    test "it adds a user to group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, group_user} = Group.add_user(group, user.id)

      assert group_user.group_id == group.id
      assert group_user.user_id == user.id
    end

    test "it returns an error if the user is already part of group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, _} = Group.add_user(group, user.id)

      {:error, message} = Group.add_user(group, user.id)
      assert message == "User is already part of room"
    end

    test "does not add a user to a single DM group" do
      group = %Group{name: "__dm_group__"}
      {:error, message} = Group.add_user(group, 42)
      assert message == "Users can't join existing direct messages"
    end

    test "does not add a user to a multi DM group" do
      group = %Group{name: "__multi_dm_group__"}
      {:error, message} = Group.add_user(group, 42)
      assert message == "Users can't join existing direct messages"
    end
  end

  describe "Stitch.Group.remove_user/2" do
    test "it removes a user from group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, _} = Group.add_user(group, user.id)
      assert :ok = Group.remove_user(group, user.id)
    end

    test "it returns a message if the user is not part of the group" do
      group = insert(:group)
      user = insert(:user)
      assert {:error, :not_member} = Group.remove_user(group, user.id)
    end

    test "does not remove a user from a single DM group" do
      group = %Group{name: "__dm_group__"}
      assert {:error, :direct_message} = Group.remove_user(group, 42)
    end

    test "does not remove a user from a multi DM group" do
      group = %Group{name: "__multi_dm_group__"}
      assert {:error, :direct_message} = Group.remove_user(group, 42)
    end

    test "does not remove users with admin or member role from the default group" do
      team = insert(:team)
      group = insert(:group, team: team, is_default: true)
      user = insert(:user, team: team)
      assert {:error, :default_group} = Group.remove_user(group, user)
    end

    test "allows a guest user to be removed from the default group" do
      team = insert(:team)
      default_group = insert(:group, team: team, is_default: true)
      group = insert(:group, team: team)
      for role <- ["single-room-guest", "multi-room-guest"] do
        guest = insert(:user, team: team, roles: [role], groups_as_guest: [group.id])
        insert(:group_user, group: group, user: guest)
        insert(:group_user, group: default_group, user: guest)

        assert :ok == Group.remove_user(default_group, guest)
      end
    end
  end

  describe "Stitch.Group.hide/2" do
    test "it sets single-dm group_user's is_hidden field to true" do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      {:ok, single_dm} = Group.create_single_dm(bob, [bob.id, joe.id])

      {:ok, group_user} = Group.hide(single_dm.id, bob)

      assert group_user.is_hidden
      assert Repo.get!(GroupUser, group_user.id).is_hidden
    end

    test "it sets multi-dm group_user's is_hidden field to true" do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      sam = insert(:user, team: team)
      {:ok, single_dm} = Group.create_multi_dm(bob, [bob.id, joe.id, sam.id])

      {:ok, group_user} = Group.hide(single_dm.id, bob)

      assert group_user.is_hidden
      assert Repo.get!(GroupUser, group_user.id).is_hidden
    end

    test "gives error for non-DM groups" do
      team = insert(:team)
      group = insert(:group, team: team)
      user = insert(:user, team: team)
      insert(:group_user, user: user, group: group)
      assert {:error, :invalid_group} = Group.hide(group.id, user)
    end

    test "gives error when user is not part of the DM group" do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      sam = insert(:user, team: team)
      {:ok, group} = Group.create_single_dm(bob, [bob.id, joe.id])

      assert {:error, :invalid_group} = Group.hide(group.id, sam)
    end
  end

  describe "Stitch.Group.unhide/2" do
    test "it sets single-dm group_user's is_hidden field to false" do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      {:ok, single_dm} = Group.create_single_dm(bob, [bob.id, joe.id])

      {:ok, group_user} = Group.unhide(single_dm.id, bob)

      refute group_user.is_hidden
      refute Repo.get!(GroupUser, group_user.id).is_hidden
    end

    test "it sets multi-dm group_user's is_hidden field to false" do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      sam = insert(:user, team: team)
      {:ok, single_dm} = Group.create_multi_dm(bob, [bob.id, joe.id, sam.id])

      {:ok, group_user} = Group.unhide(single_dm.id, bob)

      refute group_user.is_hidden
      refute Repo.get!(GroupUser, group_user.id).is_hidden
    end

    test "gives error for non-DM groups" do
      team = insert(:team)
      group = insert(:group, team: team)
      user = insert(:user, team: team)
      insert(:group_user, user: user, group: group)

      assert {:error, :invalid_group} = Group.unhide(group.id, user)
    end

    test "when user is not part of the group" do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      sam = insert(:user, team: team)
      {:ok, group} = Group.create_single_dm(bob, [bob.id, joe.id])

      assert {:error, :invalid_group} = Group.unhide(group.id, sam)
    end
  end

  describe "Stitch.Group.update_users/2" do
    setup do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      sam = insert(:user, team: team)
      group = insert(:group, team: team, creator: bob)
      insert(:group_user, user: bob, group: group)
      insert(:group_user, user: joe, group: group)

      {:ok, team: team, bob: bob, joe: joe, sam: sam, group: group}
    end

    test "updates group list", %{group: group, bob: bob, joe: joe, sam: sam} do
      assert {:ok, {removed_users, added_users}} = Group.update_users(group, [bob.id, sam.id])

      assert [removed_user] = removed_users
      assert removed_user.id == joe.id
      assert [added_user] = added_users
      assert added_user.id == sam.id
      assert Stitch.Repo.get_by(GroupUser, user_id: bob.id, group_id: group.id)
      refute Stitch.Repo.get_by(GroupUser, user_id: joe.id, group_id: group.id)
      assert Stitch.Repo.get_by(GroupUser, user_id: sam.id, group_id: group.id)
    end

    test "when user_ids is empty", %{group: group, bob: bob} do
      assert {:ok, _} = Group.update_users(group, [])

      assert Stitch.Repo.get_by(GroupUser, user_id: bob.id, group_id: group.id) != nil
    end

    test "doesn't remove creator", %{group: group, bob: bob, sam: sam} do
      assert {:ok, _} = Group.update_users(group, [sam.id])

      assert Stitch.Repo.get_by(GroupUser, user_id: bob.id, group_id: group.id) != nil
    end

    test "doesn't add user from another team", %{group: group, bob: bob} do
      sam = insert(:user)

      assert {:ok, _} = Group.update_users(group, [bob.id, sam.id])

      assert Stitch.Repo.get_by(GroupUser, user_id: sam.id, group_id: group.id) == nil
    end

    test "doesn't allow to update members in a direct message room", %{bob: bob, joe: joe, sam: sam} do
      {:ok, group} = Group.create_single_dm(bob, [bob.id, joe.id])

      {:error, message} = Group.update_users(group, [bob.id, sam.id])

      assert message == "Can't update members in a direct message room"
    end
  end

  describe "create_single_dm/2" do
    setup do
      team = insert(:team)
      user_1 = insert(:user, team: team)
      user_2 = insert(:user, team: team)
      {:ok, user_1: user_1, user_2: user_2, team: team}
    end

    test "creates a DM group", %{user_1: user_1, user_2: user_2} do
      assert {:ok, group} = Group.create_single_dm(user_1, [user_1.id, user_2.id])
      assert group.name == "__dm_group__"
      assert group.slug =~ "__dm:"
      assert group.creator_user_id == user_1.id
      assert GroupQueries.user_is_member?(group.id, user_1.id)
      assert GroupQueries.user_is_member?(group.id, user_2.id)
    end

    test "requires 2 user ids", %{user_1: user} do
      assert {:error, :user_id_count_is_not_2} = Group.create_single_dm(user, [])
    end

    test "requires the creator to be in the user ids list", %{user_1: user_1, user_2: user_2, team: team} do
      user_3 = insert(:user, team: team)
      assert {:error, :creator_id_is_not_in_user_ids} = Group.create_single_dm(user_1, [user_2.id, user_3.id])
    end

    test "allows guests to DM users in mutual groups", %{user_1: user_1, user_2: user_2, team: team} do
      group = insert(:group, team: team)
      guest = insert(:user, team: team, roles: ["single-room-guest"], groups_as_guest: [group.id])
      insert(:group_user, user: guest, group: group)
      insert(:group_user, user: user_1, group: group)

      assert {:ok, _} = Group.create_single_dm(guest, [guest.id, user_1.id])
      assert {:error, :invalid_user_ids} = Group.create_single_dm(guest, [guest.id, user_2.id])
    end

    test "allows a self-DM", %{user_1: user} do
      assert {:ok, _} = Group.create_single_dm(user, [user.id, user.id])
    end
  end

  describe "create_multi_dm/2" do
    setup do
      team = insert(:team)
      user_1 = insert(:user, team: team)
      user_2 = insert(:user, team: team)
      user_3 = insert(:user, team: team)
      {:ok, user_1: user_1, user_2: user_2, user_3: user_3, team: team}
    end

    test "creates a DM group", %{user_1: user_1, user_2: user_2, user_3: user_3} do
      assert {:ok, group} = Group.create_multi_dm(user_1, [user_1.id, user_2.id, user_3.id])
      assert group.name == "__multi_dm_group__"
      assert group.slug =~ "__dm:"
      assert group.creator_user_id == user_1.id
      assert GroupQueries.user_is_member?(group.id, user_1.id)
      assert GroupQueries.user_is_member?(group.id, user_2.id)
      assert GroupQueries.user_is_member?(group.id, user_3.id)
    end

    test "requires at least 3 user ids", %{user_1: user} do
      assert {:error, :user_id_count_is_not_3_or_more} = Group.create_multi_dm(user, [])
    end

    test "requires the creator to be in the user ids list", %{user_1: user_1, user_2: user_2, user_3: user_3, team: team} do
      user_4 = insert(:user, team: team)
      user_ids = [user_2.id, user_3.id, user_4.id]
      assert {:error, :creator_id_is_not_in_user_ids} = Group.create_multi_dm(user_1, user_ids)
    end

    test "allows guests to DM users in mutual groups", %{user_1: user_1, user_2: user_2, user_3: user_3, team: team} do
      group_1 = insert(:group, team: team)
      group_2 = insert(:group, team: team)
      guest = insert(:user, team: team, roles: ["multi-room-guest"], groups_as_guest: [group_1.id, group_2.id])
      insert(:group_user, user: guest, group: group_1)
      insert(:group_user, user: guest, group: group_2)
      insert(:group_user, user: user_1, group: group_1)
      insert(:group_user, user: user_2, group: group_2)

      assert {:ok, _} = Group.create_multi_dm(guest, [guest.id, user_1.id, user_2.id])
      assert {:error, :invalid_user_ids} = Group.create_multi_dm(guest, [guest.id, user_2.id, user_3.id])
    end
  end

  describe "remove/1" do
    test "gives an error when the group is a single DM" do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      {:ok, group} = Stitch.Group.create_single_dm(bob, [bob.id, joe.id])

      assert {:error, :direct_message} = Group.remove(group)
    end

    test "gives an error when the group is a multi DM" do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      sam = insert(:user, team: team)
      {:ok, group} = Stitch.Group.create_single_dm(bob, [bob.id, joe.id, sam.id])

      assert {:error, :direct_message} = Group.remove(group)
    end

    test "given an error for the default group" do
      group = insert(:group, is_default: true)
      assert {:error, :default_group} = Group.remove(group)
    end

    test "removes associated group_user records" do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      group = insert(:group)
      group_user_bob = insert(:group_user, user: bob, group: group)
      group_user_joe = insert(:group_user, user: joe, group: group)
      assert {:ok, group} = Group.remove(group)
      assert group.id == group.id
      assert Stitch.Repo.get(Stitch.GroupQueries, group_user_bob.id) == nil
      assert Stitch.Repo.get(Stitch.GroupQueries, group_user_joe.id) == nil
    end

    test "removes associated messages" do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group)
      insert(:group_user, user: user, group: group)
      assert {:ok, %{message: message}} = Stitch.Message.create(group.id, user, %{"text_content" => "Hello, World!"})
      assert {:ok, group} = Group.remove(group)
      assert Stitch.Repo.get(Stitch.Message, message.id) == nil
    end
  end
end
