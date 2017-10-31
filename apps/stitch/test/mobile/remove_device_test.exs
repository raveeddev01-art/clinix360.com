defmodule Stitch.Mobile.RemoveDeviceTest do
  use Stitch.DataCase
  alias Stitch.Mobile
  alias Stitch.Mobile.Device

  test "remove device with given token" do
    bob = insert(:user)

    {:ok, device} = Mobile.register_device(bob, %{
      "name" => "Bob's iPad",
      "type" => "ios",
      "token" => "foobarbaz"
    })

    assert {1, _} = Mobile.remove_device(bob, device.token)
    assert Repo.get(Device, device.id) == nil
  end

  test "device with given token doesn't exist" do
    bob = insert(:user)

    {:ok, device} = Mobile.register_device(bob, %{
      "name" => "Bob's iPad",
      "type" => "ios",
      "token" => "foobarbaz"
    })

    assert {0, _} = Mobile.remove_device(bob, "42")
    assert Repo.get(Device, device.id) != nil
  end
end
