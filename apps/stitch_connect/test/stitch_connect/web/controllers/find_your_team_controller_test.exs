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
end
