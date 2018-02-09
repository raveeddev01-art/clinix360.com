defmodule Stitch.AccountsTest do
  use Stitch.DataCase, async: true
  alias Stitch.Accounts

  describe "Accounts.create_user_with_email_only/1" do
    test "it creates user with email address" do
      user = Accounts.create_user_with_email_only("sergiotapia@outlook.com")
      assert user.email == "sergiotapia@outlook.com"
    end

    test "returns error when given nil" do
      {:error, message} = Accounts.create_user_with_email_only(nil)
      assert message == "Email cannot be blank or nil."
    end

    test "returns error when given empty string" do
      {:error, message} = Accounts.create_user_with_email_only("")
      assert message == "Email cannot be blank or nil."
    end

    test "returns error when given email domain is prohibited" do
      {:error, %Ecto.Changeset{} = changeset} = Accounts.create_user_with_email_only("furqan@sina.com")
      assert changeset.errors == [email: {"host %{host} is not supported", [host: "sina.com"]}]
    end
  end

  describe "Accounts.update_and_complete_user_onboarding/2" do
    test "it onboards the user, sets his roles and creates his self DM" do
      team = insert(:team)
      user = insert(:user, %{email: "sergio@email.com", onboarded: false})
      attrs = %{
        fullname: "Sergio Tapia",
        username: "sergiotapia",
        password: "Password123!",
        phone_number: "1231231234",
        pin: "0000",
        roles: ["admin"],
        team_id: team.id
      }

      user = Accounts.update_and_complete_user_onboarding(user.id, attrs)
      assert user.team_id == team.id
      assert user.roles == ["admin"]
      assert Stitch.Repo.get_by Stitch.Group, %{
        name: "__dm_group__",
        slug: "__dm:#{user.id}.#{user.id}"
      }

      assert String.contains?(user.profile_image_url, "default")
      assert String.contains?(user.profile_image_thumb_url, "default")
    end
  end

  describe "Accounts.create_and_complete_user_onboarding/1" do
    test "it onboards the user and sets the admin role for his new team" do
      team = insert(:team)
      attrs = %{
        email: "sergio@gmail.com",
        fullname: "Sergio Tapia",
        username: "sergiotapia3",
        password: "Password123!",
        phone_number: "1231231234",
        pin: "0000",
        roles: ["admin"],
        team_id: team.id
      }
      user = Accounts.create_and_complete_user_onboarding(attrs)
      assert user.team_id == team.id
      assert user.roles == ["admin"]
    end
  end

  describe "Accounts.delete_profile_image/1" do
    test "It should set the avatar image to some random default one" do
      image = "https://localhost.test:4443/images/some-avatar.png"

      user = insert(:user, %{profile_image_url: image, profile_image_thumb_url: image})
      {:ok, user} = Accounts.delete_profile_image(user.id)
      assert String.contains?(user.profile_image_url, "default")
      assert String.contains?(user.profile_image_thumb_url, "default")
    end
  end
end
