defmodule Stitch.GroupTest do
  use ExUnit.Case, async: true
  import Stitch.Factory
  alias Stitch.Group

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
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
      {:ok, group} = Group.toggle_public(group.id, true)
      assert group.public == true
    end

    test "it sets public to false" do
      group = insert(:group, %{public: true})
      {:ok, group} = Group.toggle_public(group.id, false)
      assert group.public == false
    end
  end

  describe "Stitch.Group.invite/2" do
    test "it adds a user to group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, group_user} = Group.invite(group.id, user.id)

      assert group_user.group_id == group.id
      assert group_user.user_id == user.id
    end

    test "it returns an error if the user is already part of group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, _} = Group.invite(group.id, user.id)

      {:error, changeset} = Group.invite(group.id, user.id)
      {message, _} = changeset.errors[:user_id]
      assert message == "User is already part of group"
    end
  end

  describe "Stitch.Group.remove/2" do
    test "it removes a user from group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, _} = Group.invite(group.id, user.id)
      {:ok, message} = Group.remove(group, user.id)
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
end
