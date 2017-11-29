defmodule Stitch.MessageAuthorizationTest do
  use Stitch.DataCase, async: true
  alias Stitch.MessageAuthorization

  test "can_delete?/2 returns true when user is sender" do
    bob = build(:user, id: 42)
    message = build(:message, user_id: bob.id)

    assert MessageAuthorization.can_delete?(message, bob)
  end

  test "can_delete?/2 returns true when user is an admin" do
    admin = build(:user, id: 42, roles: ["admin"])
    bob = build(:user, id: 43)
    message = build(:message, user_id: bob.id)

    assert MessageAuthorization.can_delete?(message, admin)
  end

  test "can_delete?/2 returns false when non-admin user isn't the sender" do
    bob = build(:user, id: 42)
    jim = build(:user, id: 43)
    message = build(:message, user_id: bob.id)

    refute MessageAuthorization.can_delete?(message, jim)
  end
end
