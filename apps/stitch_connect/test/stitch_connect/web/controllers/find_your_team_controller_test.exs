defmodule StitchConnect.Web.FindYourTeamControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  use Bamboo.Test
  alias Stitch.{FindYourTeam, Repo}

  describe "POST /find-your-team" do
    test "when a user with the given email exists", %{conn: conn} do
      user = insert(:user)

      json =
        conn
        |> post(api_v1_find_your_team_path(conn, :create), %{"email" => user.email})
        |> json_response(200)

      token = Repo.get_by(FindYourTeam.Token, email: user.email)

      assert token
      assert json["message"] == "Email has been sent to #{user.email}. Please check your inbox."
      assert_delivered_email FindYourTeam.email(token, @endpoint.url)
    end

    test "when no user with the given email exists", %{conn: conn} do
      json =
        conn
        |> post(api_v1_find_your_team_path(conn, :create), %{"email" => "nonexistentuer@example.com"})
        |> json_response(:not_found)

      assert json["message"] == "Email not found."
    end
  end

  describe "DELETE /find-your-team/:token" do
    test "when the token exists", %{conn: conn} do
      team_1 = insert(:team)
      team_2 = insert(:team)
      team_3 = insert(:team)
      insert(:user, team: team_1, email: "foo@example.com")
      insert(:user, team: team_2, email: "foo@example.com")
      insert(:user, team: team_3, email: "bar@example.com")

      %{token: token} = FindYourTeam.create_or_get_token!("foo@example.com")

      %{"teams" => teams} =
        conn
        |> delete(api_v1_find_your_team_path(conn, :delete, token))
        |> json_response(200)

      assert length(teams) == 2
      assert %{"name" => team_1.name, "slug" => team_1.slug} in teams
      assert %{"name" => team_2.name, "slug" => team_2.slug} in teams

      refute FindYourTeam.get_by_token(token)
    end

    test "when the token doesn't exist", %{conn: conn} do
      json =
        conn
        |> delete(api_v1_find_your_team_path(conn, :delete, "DoesntExist"))
        |> json_response(:not_found)

      assert json["message"] == "Token not found."
    end
  end
end
