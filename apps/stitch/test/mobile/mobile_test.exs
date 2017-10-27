defmodule Stitch.MobileTest do
  use Stitch.DataCase
  alias Stitch.Mobile

  describe "devices" do
    test "list_user_devices/1 returns all user's devices" do
      bob = insert(:user)
      device = insert(:mobile_device, user: bob)

      device_ids =
        bob.id
        |> Mobile.list_user_devices
        |> Enum.map(& &1.id)

      assert device_ids == [device.id]
    end

    test "register_device/2 inserts a user's device into the database" do
      bob = insert(:user)
      user_id = bob.id

      Mobile.register_device(bob, %{
        "name" => "Bob's iPad",
        "type" => "ios",
        "token" => "foobarbaz"
      })

      assert [%Mobile.Device{
        user_id: ^user_id,
        name: "Bob's iPad",
        type: "ios",
        token: "foobarbaz"
      }] = Mobile.list_user_devices(bob.id)
    end
  end

  describe "badge_value/1" do
    test "sums values accross all the groups the user is member of" do
    end

    test "when global mobile notification setting is 'everything'" do
    end

    test "when global mobile notification setting is 'mentions'" do
    end

    test "when global mobile notification setting is 'nothing'" do
    end

    test "when room-specific mobile notification setting is 'everything'" do
    end

    test "when room-specific mobile notification setting is 'mentions'" do
    end

    test "when room-specific mobile notification setting is 'nothing'" do
    end

    test "when room is dm and global mobile notification setting is 'everything'" do
    end

    test "when room is dm global mobile notification setting is 'mentions'" do
    end

    test "when room is dm global mobile notification setting is 'nothing'" do
    end
  end
end
