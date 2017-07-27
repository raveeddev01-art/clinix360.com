defmodule Stitch.Accounts.AdminTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Accounts.Admin.update_firstname_and_lastname/3" do
    test "it updates the first_name and last_name" do
      user = insert(:user, %{first_name: "John", last_name: "Doe"})
      {:ok, user} = Stitch.Accounts.Admin.update_firstname_and_lastname(
        user.id,
        "Jake",
        "Dough"
      )
      assert user.first_name == "Jake"
      assert user.last_name == "Dough"
    end
  end

  describe "Stitch.Accounts.Admin.update_phone_number/2" do
    test "it updates the phone_number" do
      user = insert(:user, %{phone_number: "1231231234"})
      {:ok, user} = Stitch.Accounts.Admin.update_phone_number(user.id, "9999999999")
      assert user.phone_number == "9999999999"
    end
  end

  describe "Stitch.Accounts.Admin.update_title/2" do
    test "it updates the title" do
      user = insert(:user, %{title: "Painter"})
      {:ok, user} = Stitch.Accounts.Admin.update_title(user.id, "Hardware")
      assert user.title == "Hardware"
    end
  end

  describe "Stitch.Accounts.Admin.update_profile_image_url/2" do
    test "it updates the profile image url" do
      user = insert(:user, %{profile_image_url: "https://foobar.com/image.jpg"})
      {:ok, user} = Stitch.Accounts.Admin.update_profile_image_url(user.id, "https://foobar.com/image2.jpg")
      assert user.profile_image_url == "https://foobar.com/image2.jpg"
    end
  end
end
