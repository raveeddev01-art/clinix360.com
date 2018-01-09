defmodule Stitch.Mobile.RemoveDeviceTest do
  use Stitch.DataCase
  alias Stitch.Mobile
  alias Stitch.Mobile.Device

  test "remove device with given token" do
    device = insert(:mobile_device)

    Mobile.remove_device(device.type, device.token)

    assert Repo.get(Device, device.id) == nil
  end

  test "device with given token doesn't exist" do
    insert(:mobile_device)
    initial_count = device_count()

    Mobile.remove_device("ios", "doesntexist")

    assert device_count() == initial_count
  end

  defp device_count do
    Repo.one! from d in Device, select: count(d.id)
  end
end
