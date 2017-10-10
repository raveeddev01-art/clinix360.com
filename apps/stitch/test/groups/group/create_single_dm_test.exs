defmodule Stitch.Group.CreateSingleDmTest do
  use Stitch.DataCase, async: true
  alias Stitch.Group

  test "when user_ids is empty" do
    user = %Stitch.Accounts.User{}
    {:error, reason} = Group.create_single_dm(user, [])
    assert reason == :user_id_count_is_not_2
  end

  test "when user_ids only has 1 id" do
    user = %Stitch.Accounts.User{}
    {:error, reason} = Group.create_single_dm(user, [42])
    assert reason == :user_id_count_is_not_2
  end

  test "when user_ids has more than 2 ids" do
    user = %Stitch.Accounts.User{}
    {:error, reason} = Group.create_single_dm(user, [42, 43, 44])
    assert reason == :user_id_count_is_not_2
  end

  test "when user_ids is neither the current user's" do
    user = %Stitch.Accounts.User{id: 42}
    {:error, reason} = Group.create_single_dm(user, [43, 44])
    assert reason == :creator_id_is_not_in_user_ids
  end

  test "when group with the same users exist" do
    team = insert(:team)
    bob = insert(:user, team: team)
    joe = insert(:user, team: team)
    {:ok, _} = Group.create_single_dm(bob, [bob.id, joe.id])

    {:error, reason} = Group.create_single_dm(bob, [bob.id, joe.id])

    assert reason == :already_exists
  end

  test "group name is __dm_group__" do
    team = insert(:team)
    bob = insert(:user, team: team)
    joe = insert(:user, team: team)

    {:ok, group} = Group.create_single_dm(bob, [bob.id, joe.id])

    assert group.name == "__dm_group__"
  end

  test "group slug is __dm:x.y" do
    team = insert(:team)
    bob = insert(:user, team: team)
    joe = insert(:user, team: team)

    {:ok, group} = Group.create_single_dm(bob, [bob.id, joe.id])

    assert group.slug == "__dm:#{bob.id}.#{joe.id}"
  end

  test "group is not public" do
    team = insert(:team)
    bob = insert(:user, team: team)
    joe = insert(:user, team: team)

    {:ok, group} = Group.create_single_dm(bob, [bob.id, joe.id])

    refute group.public
  end
end
