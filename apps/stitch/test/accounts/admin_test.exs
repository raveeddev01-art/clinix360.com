defmodule Stitch.Accounts.AdminTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Accounts.Admin.deactivate/1" do
    test "it deactivates the account" do
      user = insert(:user, %{disabled: false})
      {:ok, user} = Stitch.Accounts.Admin.deactivate(user.id)
      assert user.disabled == true
    end
  end

  describe "Stitch.Accounts.Admin.update_user/2" do
    test "it updates the first_name and last_name" do
      user = insert(:user, %{first_name: "John", last_name: "Doe"})
      {:ok, user} = Stitch.Accounts.Admin.update_user( user.id, %{first_name: "Jake", last_name: "Dough" })
      assert user.first_name == "Jake"
      assert user.last_name == "Dough"
    end

    test "it updates the phone_number" do
      user = insert(:user, %{phone_number: "1231231234"})
      {:ok, user} = Stitch.Accounts.Admin.update_user(user.id, %{phone_number: "9999999999"})
      assert user.phone_number == "9999999999"
    end

    test "it updates the title" do
      user = insert(:user, %{title: "Painter"})
      {:ok, user} = Stitch.Accounts.Admin.update_user(user.id, %{title: "Hardware" })
      assert user.title == "Hardware"
    end

    test "it updates the profile image url" do
      user = insert(:user, %{profile_image_url: "https://foobar.com/image.jpg"})
      {:ok, user} = Stitch.Accounts.Admin.update_user(user.id, %{profile_image_url: "https://foobar.com/image2.jpg"})
      assert user.profile_image_url == "https://foobar.com/image2.jpg"
    end

    test "it updates the username" do
      user = insert(:user, %{username: "sergiotapia"})
      {:ok, user} = Stitch.Accounts.Admin.update_user(user.id, %{username: "danieltapia"})
      assert user.username == "danieltapia"
    end

    test "it allows user to update to same username" do
      user = insert(:user, %{username: "sergiotapia"})
      {:ok, user} = Stitch.Accounts.Admin.update_user(user.id, %{username: "sergiotapia"})
      assert user.username == "sergiotapia"
    end

    test "it updates the pin" do
      user = insert(:user, %{pin: "1234"})
      {:ok, user} = Stitch.Accounts.Admin.update_user(user.id, %{pin: "4444"})
      assert user.pin == "4444"
    end

    test "it dissallows the same username within the same team" do
      team = insert(:team)
      _user = insert(:user, %{username: "sergiotapia", team_id: team.id})
      user2 = insert(:user, %{username: "danieltapia", team_id: team.id})
      {:error, changeset} = Stitch.Accounts.Admin.update_user(user2.id, %{username: "sergiotapia" })
      assert Enum.count(changeset.errors) == 1
    end

    test "it updates the email" do
      user = insert(:user, %{email: "sergiotapia@outlook.com"})
      {:ok, user} = Stitch.Accounts.Admin.update_user(user.id, %{email: "danieltapia@outlook.com" })
      assert user.email == "danieltapia@outlook.com"
    end

    test "it allows user to update to same email" do
      user = insert(:user, %{email: "sergiotapia@outlook.com"})
      {:ok, user} = Stitch.Accounts.Admin.update_user(user.id, %{email: "sergiotapia@outlook.com"})
      assert user.email == "sergiotapia@outlook.com"
    end

    test "it dissallows the same email within the same team" do
      team = insert(:team)
      _user = insert(:user, %{email: "sergiotapia@outlook.com", team_id: team.id})
      user2 = insert(:user, %{email: "danieltapia@outlook.com", team_id: team.id})
      {:error, changeset} = Stitch.Accounts.Admin.update_user(user2.id,%{email: "sergiotapia@outlook.com"})
      assert Enum.count(changeset.errors) == 1
    end
  end

end
