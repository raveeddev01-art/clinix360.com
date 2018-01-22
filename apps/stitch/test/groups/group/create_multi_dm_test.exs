defmodule Stitch.Group.CreateMultiDmTest do
  use Stitch.DataCase, async: true
  alias Stitch.Group

  test "when user_ids is empty" do
    user = %Stitch.Accounts.User{}
    {:error, reason} = Group.create_multi_dm(user, [])
    assert reason == :user_id_count_is_not_3_or_more
  end

  test "when user_ids only has 1 id" do
    user = %Stitch.Accounts.User{}
    {:error, reason} = Group.create_multi_dm(user, [42])
    assert reason == :user_id_count_is_not_3_or_more
  end

  test "when user_ids only has 2 ids" do
    user = %Stitch.Accounts.User{}
    {:error, reason} = Group.create_multi_dm(user, [42, 43])
    assert reason == :user_id_count_is_not_3_or_more
  end

  test "when current user's ID is not in user_ids" do
    user = %Stitch.Accounts.User{id: 42}
    {:error, reason} = Group.create_multi_dm(user, [43, 44, 45])
    assert reason == :creator_id_is_not_in_user_ids
  end

  test "when group with the same users exist" do
    team = insert(:team)
    bob = insert(:user, team: team)
    joe = insert(:user, team: team)
    sam = insert(:user, team: team)
    {:ok, _group} = Group.create_multi_dm(bob, [bob.id, joe.id, sam.id])
    {:error, changeset} = Group.create_multi_dm(bob, [bob.id, joe.id, sam.id])

    assert hd(errors_on(changeset).slug) =~ "taken"
  end

  test "group name is __multi_dm_group__" do
    team = insert(:team)
    bob = insert(:user, team: team)
    joe = insert(:user, team: team)
    sam = insert(:user, team: team)

    {:ok, group} = Group.create_multi_dm(bob, [bob.id, joe.id, sam.id])

    assert group.name == "__multi_dm_group__"
  end

  test "group slug is __dm:x.y.z" do
    team = insert(:team)
    bob = insert(:user, team: team)
    joe = insert(:user, team: team)
    sam = insert(:user, team: team)

    {:ok, group} = Group.create_multi_dm(bob, [bob.id, joe.id, sam.id])

    assert group.slug == "__dm:#{bob.id}.#{joe.id}.#{sam.id}"
  end

  test "group is not public" do
    team = insert(:team)
    bob = insert(:user, team: team)
    joe = insert(:user, team: team)
    sam = insert(:user, team: team)

    {:ok, group} = Group.create_multi_dm(bob, [bob.id, joe.id, sam.id])

    refute group.public
  end
end
