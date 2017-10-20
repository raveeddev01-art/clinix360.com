defmodule Stitch.GroupTest do
  use Stitch.DataCase, async: true
  alias Stitch.{Group, GroupUser}

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
      assert error == "User has to be member of group to favorite it."
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
      {:error, message} = Group.toggle_public(group, false)
      assert message == "Direct messages' privacy setting can't be changed"
    end

    test "does not change multi DM groups" do
      group = %Group{name: "__multi_dm_group__"}
      {:error, message} = Group.toggle_public(group, false)
      assert message == "Direct messages' privacy setting can't be changed"
    end
  end

  describe "Stitch.Group.add_user/2" do
    test "it adds a user to group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, %{group_user: group_user}} = Group.add_user(group, user.id)

      assert group_user.group_id == group.id
      assert group_user.user_id == user.id
    end

    test "it returns an error if the user is already part of group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, _} = Group.add_user(group, user.id)

      {:error, :group_user, changeset, _} = Group.add_user(group, user.id)
      {message, _} = changeset.errors[:user_id]
      assert message == "User is already part of group"
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

  describe "Stitch.Group.remove/2" do
    test "it removes a user from group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, _} = Group.add_user(group, user.id)
      {:ok, message, _} = Group.remove(group, user.id)
      assert message == "User has been removed from the group"
    end

    test "it returns a message if the user is not part of the group" do
      group = insert(:group)
      user = insert(:user)
      {:error, message} = Group.remove(group, user.id)
      assert message == "User is not part of this group"
    end

    test "does not remove a user from a single DM group" do
      group = %Group{name: "__dm_group__"}
      {:error, message} = Group.remove(group, 42)
      assert message == "Users can't leave direct messages"
    end

    test "does not remove a user from a multi DM group" do
      group = %Group{name: "__multi_dm_group__"}
      {:error, message} = Group.remove(group, 42)
      assert message == "Users can't leave direct messages"
    end
  end

  describe "Stitch.Group.hide/2" do
    test "it sets single-dm group_user's is_hidden field to true" do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      {:ok, single_dm} = Group.create_single_dm(bob, [bob.id, joe.id])

      {:ok, group_user} = Group.hide(single_dm, bob.id)

      assert group_user.is_hidden
      assert Repo.get!(GroupUser, group_user.id).is_hidden
    end

    test "it sets multi-dm group_user's is_hidden field to true" do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      sam = insert(:user, team: team)
      {:ok, single_dm} = Group.create_multi_dm(bob, [bob.id, joe.id, sam.id])

      {:ok, group_user} = Group.hide(single_dm, bob.id)

      assert group_user.is_hidden
      assert Repo.get!(GroupUser, group_user.id).is_hidden
    end

    test "when group is not a DM" do
      group = build(:group)

      {:error, message} = Group.hide(group, 42)

      assert message == "Only direct messages can be hidden"
    end

    test "when user is not part of the group" do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      sam = insert(:user, team: team)
      {:ok, group} = Group.create_single_dm(bob, [bob.id, joe.id])

      {:error, message} = Group.hide(group, sam.id)

      assert message == "User is not part of this group"
    end
  end

  describe "Stitch.Group.unhide/2" do
    test "it sets single-dm group_user's is_hidden field to false" do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      {:ok, single_dm} = Group.create_single_dm(bob, [bob.id, joe.id])

      {:ok, group_user} = Group.unhide(single_dm, bob.id)

      refute group_user.is_hidden
      refute Repo.get!(GroupUser, group_user.id).is_hidden
    end

    test "it sets multi-dm group_user's is_hidden field to false" do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      sam = insert(:user, team: team)
      {:ok, single_dm} = Group.create_multi_dm(bob, [bob.id, joe.id, sam.id])

      {:ok, group_user} = Group.unhide(single_dm, bob.id)

      refute group_user.is_hidden
      refute Repo.get!(GroupUser, group_user.id).is_hidden
    end

    test "when group is not a DM" do
      group = build(:group)

      {:error, message} = Group.unhide(group, 42)

      assert message == "Only direct messages can be hidden"
    end

    test "when user is not part of the group" do
      team = insert(:team)
      bob = insert(:user, team: team)
      joe = insert(:user, team: team)
      sam = insert(:user, team: team)
      {:ok, group} = Group.create_single_dm(bob, [bob.id, joe.id])

      {:error, message} = Group.unhide(group, sam.id)

      assert message == "User is not part of this group"
    end
  end
end
