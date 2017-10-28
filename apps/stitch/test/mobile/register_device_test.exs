defmodule Stitch.Mobile.RegisterDeviceTest do
  use Stitch.DataCase
  alias Stitch.Mobile

  test "inserts a user's device into the database" do
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
