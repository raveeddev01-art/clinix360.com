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

  describe "Accounts.update_user_password/3" do
    test "it only updates the user password if the old password provided is valid" do
      user = insert(:user, %{email: "sadan@example.com", password_hash: Comeonin.Bcrypt.hashpwsalt("sadan123")})
      {:error, message} = Accounts.update_user_password(user.id, "sadan1234", "stitch123")
      assert message == "Invalid Password for user"
    end
  end

  describe "Accounts.update_profile_image/3" do
    test "pass if admin is trying to update profile image of other user" do
      admin = insert(:user, %{
        roles: ["admin"],
        email: "sadan2@example.com", 
      })

      user = insert(:user, %{
        roles: ["member"],
        email: "sadan3@example.com", 
        profile_image_url: "https://s3.amazonaws.com/stitch-content/1_2_1515088620100.png"
      })

      profile_image_url2 = "https://s3.amazonaws.com/stitch-content/1_2_1515088620194.png"
      {:ok, update_user} = Accounts.update_profile_image(admin, user.id, profile_image_url2)
      assert update_user.profile_image_url == profile_image_url2
    end

    test "pass if normal is trying to update his own profile image" do
      user = insert(:user, %{
        roles: ["member"],
        email: "sadan4@example.com", 
        profile_image_url: "https://s3.amazonaws.com/stitch-content/1_2_1515088620100.png"
      })

      profile_image_url2 = "https://s3.amazonaws.com/stitch-content/1_2_1515088620194.png"
      {:ok, update_user} = Accounts.update_profile_image(user, user.id, profile_image_url2)
      assert update_user.profile_image_url == profile_image_url2
    end

    test "fail if normal is trying to update other user's profile image" do
      user1 = insert(:user, %{
        roles: ["member"],
        email: "sadan4@example.com", 
        profile_image_url: "https://s3.amazonaws.com/stitch-content/1_2_1515088620101.png"
      })

      user2 = insert(:user, %{
        roles: ["member"],
        email: "sadan4@example.com", 
        profile_image_url: "https://s3.amazonaws.com/stitch-content/1_2_1515088620102.png"
      })

      profile_image_url2 = "https://s3.amazonaws.com/stitch-content/1_2_1515088620194.png"
      updated_user = Accounts.update_profile_image(user1, user2.id, profile_image_url2)
      assert updated_user == {:error, "Unauthorized"}
    end
  end

  describe "Accounts.delete_profile_image/3" do
    test "pass if admin is trying to update delete image of other user" do
      admin = insert(:user, %{
        roles: ["admin"],
        email: "sadan2@example.com", 
      })

      user = insert(:user, %{
        roles: ["member"],
        email: "sadan3@example.com", 
        profile_image_url: "https://s3.amazonaws.com/stitch-content/1_2_1515088620100.png"
      })

      {:ok, update_user} = Accounts.delete_profile_image(admin, user.id)
      assert update_user.profile_image_url == nil
    end

    test "pass if normal is trying to delete his own profile image" do
      user = insert(:user, %{
        roles: ["member"],
        email: "sadan4@example.com", 
        profile_image_url: "https://s3.amazonaws.com/stitch-content/1_2_1515088620100.png"
      })

      {:ok, update_user} = Accounts.delete_profile_image(user, user.id)
      assert update_user.profile_image_url == nil
    end

    test "fail if normal is trying to delete other user's profile image" do
      user1 = insert(:user, %{
        roles: ["member"],
        email: "sadan4@example.com", 
        profile_image_url: "https://s3.amazonaws.com/stitch-content/1_2_1515088620101.png"
      })

      user2 = insert(:user, %{
        roles: ["member"],
        email: "sadan4@example.com", 
        profile_image_url: "https://s3.amazonaws.com/stitch-content/1_2_1515088620102.png"
      })

      updated_user = Accounts.delete_profile_image(user1, user2.id)
      assert updated_user == {:error, "Unauthorized"}
    end
  end
end
