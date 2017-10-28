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

  test "returns an error changeset when the token isn't unique for a given type" do
    insert(:mobile_device, type: "ios", token: "foobarbaz")
    bob = insert(:user)

    {:error, changeset} = Mobile.register_device(bob, %{
      "name" => "Bob's iPad",
      "type" => "ios",
      "token" => "foobarbaz"
    })

    assert changeset.errors == [token: {"has already been taken", []}]

    {:ok, _} = Mobile.register_device(bob, %{
      "name" => "Bob's Galaxy Tab",
      "type" => "android",
      "token" => "foobarbaz"
    })
  end

  test "returns an error changeset attrs has no name" do
    bob = insert(:user)

    {:error, changeset} = Mobile.register_device(bob, %{
      "type" => "ios",
      "token" => "foobarbaz"
    })

    assert changeset.errors == [name: {"can't be blank", [validation: :required]}]
  end

  test "returns an error changeset when the name is nil" do
    bob = insert(:user)

    {:error, changeset} = Mobile.register_device(bob, %{
      "name" => nil,
      "type" => "ios",
      "token" => "foobarbaz"
    })

    assert changeset.errors == [name: {"can't be blank", [validation: :required]}]
  end

  test "returns an error changeset when the name is blank" do
    bob = insert(:user)

    {:error, changeset} = Mobile.register_device(bob, %{
      "name" => "",
      "type" => "ios",
      "token" => "foobarbaz"
    })

    assert changeset.errors == [name: {"can't be blank", [validation: :required]}]
  end

  test "returns an error changeset when attrs has no token" do
    bob = insert(:user)

    {:error, changeset} = Mobile.register_device(bob, %{
      "name" => "Bob's iPad",
      "type" => "ios"
    })

    assert changeset.errors == [token: {"can't be blank", [validation: :required]}]
  end

  test "returns an error changeset when the token is nil" do
    bob = insert(:user)

    {:error, changeset} = Mobile.register_device(bob, %{
      "name" => "Bob's iPad",
      "type" => "ios",
      "token" => nil
    })

    assert changeset.errors == [token: {"can't be blank", [validation: :required]}]
  end

  test "returns an error changeset when the token is blank" do
    bob = insert(:user)

    {:error, changeset} = Mobile.register_device(bob, %{
      "name" => "Bob's iPad",
      "type" => "ios",
      "token" => ""
    })

    assert changeset.errors == [token: {"can't be blank", [validation: :required]}]
  end

  test "returns an error changeset when the type isn't ios or android" do
    bob = insert(:user)

    {:error, changeset} = Mobile.register_device(bob, %{
      "name" => "Bob's iPad",
      "type" => "foo",
      "token" => "foobarbaz"
    })

    assert changeset.errors == [type: {"is invalid", [validation: :inclusion]}]

    {:ok, _} = Mobile.register_device(bob, %{
      "name" => "Bob's iPad",
      "type" => "ios",
      "token" => "foobarbaz"
    })

    {:ok, _} = Mobile.register_device(bob, %{
      "name" => "Bob's Galaxy Tab",
      "type" => "android",
      "token" => "foobarbaz"
    })
  end
end
