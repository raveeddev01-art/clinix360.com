defmodule Stitch.UserQueriesTest do
  use Stitch.DataCase, async: true
  alias Stitch.{Accounts.User, Rand, UserQueries}

  describe "UserQueries.search/2" do
    test "returns only matching users for the team" do
      team = insert(:team)
      user = insert(:user, %{team: team, email: "example@email.com"})
      team_2 = insert(:team)
      _user_2 = insert(:user, %{team: team_2, email: "example@email.com"})
      results = UserQueries.search(user.id, "exa")
      assert Enum.count(results) == 1
    end

    test "returns users matching first_name" do
      team = insert(:team)
      insert(:user, %{first_name: "Sergio", email: "foobar@email.com", team: team})
      insert(:user, %{first_name: "Example", team: team})
      user = insert(:user, %{first_name: "fooexapple", team: team})
      results = UserQueries.search(user.id, "Exa")
      assert Enum.count(results) == 2
    end

    test "returns users matching last_name" do
      team = insert(:team)
      insert(:user, %{last_name: "Sergio", email: "foobar@email.com", team: team})
      insert(:user, %{last_name: "Example", team: team})
      user = insert(:user, %{last_name: "fooexapple", team: team})
      results = UserQueries.search(user.id, "Exa")
      assert Enum.count(results) == 2
    end

    test "returns users matching username" do
      team = insert(:team)
      insert(:user, %{username: "sergio", email: "foobar@email.com", team: team})
      insert(:user, %{username: "example", team: team})
      user = insert(:user, %{username: "fooexapple", team: team})
      results = UserQueries.search(user.id, "Exa")
      assert Enum.count(results) == 2
    end

    test "returns users matching email" do
      team = insert(:team)
      insert(:user, %{first_name: "Sergio", email: "foobar@email.com", team: team})
      insert(:user, %{first_name: "Example", team: team})
      user = insert(:user, %{first_name: "fooexapple", team: team})
      results = UserQueries.search(user.id, "obar")
      assert Enum.count(results) == 1
    end
  end

  describe "users_for_team/1" do
    test "returns users for a given team" do
      team = insert(:team, %{name: "Care Clinic"})
      insert(:user, %{first_name: "John", last_name: "Doe", team_id: team.id, onboarded: true})
      insert(:user, %{first_name: "John", last_name: "Doe", team_id: team.id, onboarded: false})
      users = UserQueries.users_for_team(team.id)
      assert Enum.count(users) == 1
    end

    test "returns error for non-integer team_id" do
      {:error, message} = UserQueries.users_for_team("asd")
      assert message == "team_id must be an integer"
    end
  end

  test "get_by_id when id is less than one" do
    {:error, message} = UserQueries.get_by_id(0)
    assert message == "Id cannot be less than 1."
  end

  test "get_by_id when id is not an integer" do
    {:error, message} = UserQueries.get_by_id("a")
    assert message == "Id isn't an integer."
  end

  test "get_by_id when id doesn't exist in the database" do
    {:not_found, message} = UserQueries.get_by_id(1)
    assert message == "User with id 1 was not found."
  end

  test "get_by_id returns user record for id" do
    user = insert(:user)
    record = UserQueries.get_by_id(user.id)
    assert record.id == user.id
  end

  describe "UserQueries.get_by_token/1" do
    test "returns malformed token error for incorrect token" do
      {:error, message} = UserQueries.get_by_token("abc")
      assert message == "Token is malformed."
    end

    test "returns not found message for unknown token" do
      token = Rand.token(32)
      {:not_found, message} = UserQueries.get_by_token(token)
      assert message == "User with token #{token} was not found."
    end

    test "returns user given an existing token" do
      token = Rand.token(32)
      insert(:user, %{token: token})
      user = UserQueries.get_by_token(token)
      assert user.token == token
      assert user.id != nil
    end
  end

  describe "UserQueries.team_member_with_email/2" do
    test "returns true or false if user exists or not" do
      team = insert(:team)
      insert(:user, team: team, email: "example@email.com")

      assert %User{email: "example@email.com"} =
        UserQueries.team_member_with_email(team.id, "example@email.com")
    end

    test "insensitivity to case of email" do
      team = insert(:team)
      insert(:user, team: team, email: "Example@email.com")

      assert %User{email: "Example@email.com"} =
        UserQueries.team_member_with_email(team.id, "example@email.com")
    end
  end

  describe "UserQueries.user_with_email_exists?/1" do
    test "returns true if a user with the given email exists" do
      insert(:user, email: "foo@example.com")
      assert UserQueries.user_with_email_exists?("foo@example.com")
    end

    test "returns false when no user with the given email exists" do
      insert(:user, email: "bar@example.com")
      refute UserQueries.user_with_email_exists?("foo@example.com")
    end
  end
end
