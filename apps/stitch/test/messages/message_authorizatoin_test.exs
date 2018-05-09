defmodule Stitch.MessageAuthorizationTest do
  use Stitch.DataCase, async: true
  alias Stitch.MessageAuthorization

  test "can_delete?/2 returns true when user is sender" do
    bob = build(:user, id: 42)
    message = build(:message, user_id: bob.id)
    group = build(:group)

    assert MessageAuthorization.can_delete?(message, bob, group)
  end

  test "can_delete?/2 returns true when user is an admin on team" do
    admin = build(:user, id: 42, roles: ["admin"])
    bob = build(:user, id: 43)
    message = build(:message, user_id: bob.id)
    group = build(:group, team_id: admin.team_id)

    assert MessageAuthorization.can_delete?(message, admin, group)
  end

  test "can_delete?/2 returns false when user is an admin on different team" do
    admin = build(:user, id: 42, roles: ["admin"], team_id: 1)
    bob = build(:user, id: 43, team_id: 1, team_id: 2)

    message = build(:message, user: bob)
    group = build(:group, team_id: 2)

    assert MessageAuthorization.can_delete?(message, admin, group) == false
  end

  test "can_delete?/2 returns false when non-admin user isn't the sender" do
    bob = build(:user, id: 42)
    jim = build(:user, id: 43)
    message = build(:message, user_id: bob.id)
    group = build(:group, team_id: bob.team_id)

    refute MessageAuthorization.can_delete?(message, jim, group)
  end
end
