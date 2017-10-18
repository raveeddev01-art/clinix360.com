defmodule Stitch.FindYourTeamTest do
  use Stitch.DataCase, async: true
  alias Stitch.{FindYourTeam, Repo, FindYourTeam.Token}

  describe "create_or_get_token!/1" do
    test "creates a token" do
      token = FindYourTeam.create_or_get_token!("foo@example.com")

      assert token.email == "foo@example.com"
      assert token.token =~ ~r/[A-Za-z0-9_-]{12}/
      assert Repo.get_by(Token, email: token.email, token: token.token)
    end

    test "raises an error when email is nil" do
      assert_raise Postgrex.Error, fn ->
        FindYourTeam.create_or_get_token!(nil)
      end
    end

    test "raises an error when email is blank" do
      assert_raise Postgrex.Error, fn ->
        FindYourTeam.create_or_get_token!("")
      end
    end

    test "returns an existing token" do
      %Token{} = token_1 = FindYourTeam.create_or_get_token!("foo@example.com")
      %Token{} = token_2 = FindYourTeam.create_or_get_token!("foo@example.com")

      assert token_1 == token_2
    end
  end

  test "delete_token/1" do
    token = FindYourTeam.create_or_get_token!("foo@example.com")

    assert {:ok, %Token{}} = FindYourTeam.delete_token(token)
    refute FindYourTeam.get_by_token(token.token)
  end

  test "email/2" do
    token = FindYourTeam.create_or_get_token!("foo@example.com")

    email = FindYourTeam.email(token, "http://endpoint.base.url")

    assert email.to == token.email
    assert email.from =~ "support@teamstitch.com"
    assert email.subject =~ "Find your team"
    assert email.subject =~ "Stitch"
    assert email.html_body =~ "http://endpoint.base.url/find-your-team/#{token.token}"
    assert email.text_body =~ "http://endpoint.base.url/find-your-team/#{token.token}"
  end

  describe "get_by_token/1" do
    test "returns the token if it exists" do
      token = FindYourTeam.create_or_get_token!("foo@example.com")
      assert FindYourTeam.get_by_token(token.token) == token
    end

    test "returns nil if it doesn't exist" do
      refute FindYourTeam.get_by_token("DoesntExist")
    end
  end
end
