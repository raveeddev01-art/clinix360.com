defmodule Stitch.AccountsTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Accounts.create_user_with_email_only/1" do
    test "it creates user with email address" do
      user = Stitch.Accounts.create_user_with_email_only("sergiotapia@outlook.com")
      assert user.email == "sergiotapia@outlook.com"
    end

    test "returns error when given nil" do
      {:error, message} = Stitch.Accounts.create_user_with_email_only(nil)
      assert message == "Email cannot be blank or nil."
    end

    test "returns error when given empty string" do
      {:error, message} = Stitch.Accounts.create_user_with_email_only("")
      assert message == "Email cannot be blank or nil."
    end
  end

  describe "Stitch.Accounts.update_and_complete_user_onboarding/2" do
    test "it onboards the user and sets the admin role for his new team" do
      team = insert(:team)
      user = insert(:user, %{email: "sergio@email.com"})
      attrs = %{
        fullname: "Sergio Tapia",
        username: "sergiotapia",
        password: "Password123!",
        pin: "0000",
        roles: ["admin"],
        team_id: team.id
      }

      user = Stitch.Accounts.update_and_complete_user_onboarding(user.id, attrs)
      assert user.team_id == team.id
      assert user.roles == ["admin"]
    end
  end

  describe "Stitch.Accounts.invite_to_team/3" do
    test "it creates an invite for new user via email" do
      team = insert(:team)
      user = insert(:user, %{team_id: team.id})
      {:ok, user} = Stitch.Accounts.invite_to_team(team.id, user.id, "john@email.com")
      assert user.onboarded == false
      assert user.email == "john@email.com"
      assert user.team_id == team.id
    end
  end
end
