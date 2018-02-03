defmodule Stitch.Mobile.ListUserDevicesTest do
  use Stitch.DataCase
  alias Stitch.Mobile

  test "returns all user's devices" do
    bob = insert(:user)
    joe = insert(:user)
    sam = insert(:user)
    device = insert(:mobile_device, user: bob)
    insert(:mobile_device, user: joe)

    device_ids =
      bob.id
      |> Mobile.list_user_devices
      |> Enum.map(& &1.id)

    assert device_ids == [device.id]
    assert Mobile.list_user_devices(sam.id) == []
  end
end
