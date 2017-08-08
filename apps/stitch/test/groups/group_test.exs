defmodule Stitch.GroupTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Group.rename/2" do
    test "it renames the group" do
      group = insert(:group, %{name: "Example"})
      {:ok, group} = Stitch.Group.rename(group.id, "Deploy")
      assert group.name == "Deploy"
      assert group.slug == "deploy"
    end

    test "it returns error for blank string" do
      group = insert(:group, %{name: "Example"})
      {:error, reason} = Stitch.Group.rename(group.id, "")
      assert reason == "Name cannot be blank or nil"
    end

    test "it return error for nil name" do
      group = insert(:group, %{name: "Example"})
      {:error, reason} = Stitch.Group.rename(group.id, nil)
      assert reason == "Name cannot be blank or nil"
    end
  end

  describe "Stitch.Group.toggle_favorite/2" do
    test "it favorites new groups for user" do
      group = insert(:group)
      user = insert(:user, %{favorite_groups: []})
      result = Stitch.Group.toggle_favorite(group.id, user.id)
      assert result == true
    end

    test "it unfavorites existing group for user" do
      group = insert(:group)
      user = insert(:user, %{favorite_groups: [group.id]})
      result = Stitch.Group.toggle_favorite(group.id, user.id)
      assert result == false
    end
  end

  describe "Stitch.Group.toggle_public/2" do
    test "it sets public to true" do
      group = insert(:group, %{public: false})
      {:ok, group} = Stitch.Group.toggle_public(group.id, true)
      assert group.public == true
    end

    test "it sets public to false" do
      group = insert(:group, %{public: true})
      {:ok, group} = Stitch.Group.toggle_public(group.id, false)
      assert group.public == false
    end
  end

  describe "Stitch.Group.invite/2" do
    test "it adds a user to group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, group_user} = Stitch.Group.invite(group.id, user.id)

      assert group_user.group_id == group.id
      assert group_user.user_id == user.id
    end

    test "it returns an error if the user is already part of group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, _} = Stitch.Group.invite(group.id, user.id)

      {:error, changeset} = Stitch.Group.invite(group.id, user.id)
      {message, _} = changeset.errors[:user_id]
      assert message == "User is already part of group"
    end
  end

  describe "Stitch.Group.remove/2" do
    test "it removes a user from group" do
      group = insert(:group)
      user = insert(:user)
      {:ok, _} = Stitch.Group.invite(group.id, user.id)
      {:ok, message} = Stitch.Group.remove(group.id, user.id)
      assert message == "User has been removed from the group"
    end

    test "it returns a message if the user is not part of the group" do
      {:error, message} = Stitch.Group.remove(1, 1)
      assert message == "User is not part of the this group"
    end
  end
end
