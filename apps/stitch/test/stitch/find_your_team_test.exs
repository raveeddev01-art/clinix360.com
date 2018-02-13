defmodule Stitch.FindYourTeamTest do
  use Stitch.DataCase, async: true
  use Bamboo.Test
  alias Stitch.{FindYourTeam, Repo, FindYourTeam.Token}

  describe "create_team_list_token/1" do
    test "creates a token" do
      insert(:user, email: "foo@example.com")
      {:ok, token} = FindYourTeam.create_team_list_token("foo@example.com")

      assert token.email == "foo@example.com"
      assert token.token =~ ~r/[A-Za-z0-9_-]{12}/
      assert Repo.get_by(Token, email: token.email, token: token.token)
    end

    test "raises an error when email is nil" do
      assert {:error, "Not found"} = FindYourTeam.create_team_list_token(nil)
    end

    test "returns an error when email is blank" do
      assert {:error, "Not found"} = FindYourTeam.create_team_list_token("")
    end

    test "replaces old token on creation" do
      insert(:user, email: "foo@example.com")
      {:ok, %Token{} = token_1} = FindYourTeam.create_team_list_token("foo@example.com")
      {:ok, %Token{} = token_2} = FindYourTeam.create_team_list_token("foo@example.com")

      assert token_1.token != token_2.token
    end
  end

  describe "create_login_token/1" do
    test "creates login token" do
      insert(:user, email: "foo@example.com")
      {:ok, team_list_token} = FindYourTeam.create_team_list_token("foo@example.com")
      {:ok, %{login_token: login_token}} = FindYourTeam.create_login_token(team_list_token.token)
      assert [token] = Repo.all(Token)
      assert token == login_token
    end

    test "when token is blank" do
      insert(:user, email: "foo@example.com")
      {:ok, team_list_token} = FindYourTeam.create_team_list_token("foo@example.com")
      {:error, _, _, _} = FindYourTeam.create_login_token("")
      assert [token] = Repo.all(Token)
      assert team_list_token.token == token.token
    end

    test "when token doesn't exist" do
      insert(:user, email: "foo@example.com")
      {:ok, team_list_token} = FindYourTeam.create_team_list_token("foo@example.com")
      {:error, _, _, _} = FindYourTeam.create_login_token("doesntexist")
      assert [token] = Repo.all(Token)
      assert team_list_token.token == token.token
    end

    test "when token already exists exist" do
      insert(:user, email: "foo@example.com")
      insert(:find_your_team_token, email: "foo@example.com", type: "login")
      {:error, _, _, _} = FindYourTeam.create_login_token("doesntexist")
      assert [_token] = Repo.all(Token)
    end

    test "when token is expired" do
      insert(:user, email: "foo@example.com")
      team_list_token = insert(:find_your_team_token, email: "foo@example.com", type: "team_list", inserted_at: day_ago())
      {:error, _, _, _} = FindYourTeam.create_login_token(team_list_token.token)
      assert [_token] = Repo.all(Token)
    end
  end

  describe "activate_login_token/2" do
    test "activates login token" do
      team = insert(:team)
      user = insert(:user, team: team)
      find_your_team_token = insert(:find_your_team_token, email: user.email, type: "login")
      {:ok, found_user} = FindYourTeam.activate_login_token(team, find_your_team_token.token)
      assert user.id  == found_user.id
      assert [] = Repo.all(Token)
    end

    test "when token doesn't exists" do
      team = insert(:team)
      user = insert(:user, team: team)
      insert(:find_your_team_token, email: user.email, type: "login")
      {:error, _reason} = FindYourTeam.activate_login_token(team, "doesntexist")
      assert [_token] = Repo.all(Token)
    end

    test "when token is from another team" do
      team = insert(:team)
      team_2 = insert(:team)
      user = insert(:user, team: team)
      insert(:find_your_team_token, email: user.email, type: "login")
      {:error, _reason} = FindYourTeam.activate_login_token(team_2, "")
      assert [_token] = Repo.all(Token)
    end

    test "when token is expired" do
      team = insert(:team)
      user = insert(:user, team: team)
      find_your_team_token = insert(:find_your_team_token, email: user.email, type: "login", inserted_at: day_ago())
      {:error, _reason} = FindYourTeam.activate_login_token(team, find_your_team_token.token)
      assert [_token] = Repo.all(Token)
    end
  end

  test "email/2" do
    insert(:user, email: "foo@example.com")
    {:ok, token} = FindYourTeam.create_team_list_token("foo@example.com")
    email = FindYourTeam.Email.email(token, "http://endpoint.base.url")
    assert_delivered_email(email)
  end

  defp day_ago, do: Timex.shift(NaiveDateTime.utc_now, days: -1)
end
