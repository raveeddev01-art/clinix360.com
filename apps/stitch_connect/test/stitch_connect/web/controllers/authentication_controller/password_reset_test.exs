defmodule StitchConnect.Web.PasswordResetTest do
  use StitchConnect.Web.ConnCase, async: false
  import Phoenix.ChannelTest
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: Routes
  alias Stitch.Accounts.PasswordResetToken
  alias Stitch.Repo

  describe "POST /api/v1/reset_password (token creation)" do
    test "resets user password", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)

      conn =
        conn
        |> with_team_subdomain(team)

      json =
        conn
        |> post(Routes.api_v1_authentication_path(conn, :reset_password), %{email: user.email})
        |> json_response(200)

      assert %{"status" => "ok"} = json
      assert [_] = Repo.all(PasswordResetToken)
    end

    test "when email doesn't exist", %{conn: conn} do
      team = insert(:team)

      conn =
        conn
        |> with_team_subdomain(team)

      json =
        conn
        |> post(Routes.api_v1_authentication_path(conn, :reset_password), %{email: "42"})
        |> json_response(403)

      assert %{"message" => "User is not part of the team or email does not exist"} = json
    end

    test "when email is from another team", %{conn: conn} do
      team = insert(:team)
      user = insert(:user)

      conn =
        conn
        |> with_team_subdomain(team)

      json =
        conn
        |> post(Routes.api_v1_authentication_path(conn, :reset_password), %{email: user.email})
        |> json_response(403)

      assert %{"message" => "User is not part of the team or email does not exist"} = json
    end
  end

  describe "POST /api/v1/reset_password (password update)" do
    test "resets user password", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      password_reset_token = insert(:password_reset_token, user: user)
      @endpoint.subscribe("events:#{user.id}")

      conn =
        conn
        |> with_team_subdomain(team)

      json =
        conn
        |> post(Routes.api_v1_authentication_path(conn, :reset_password), %{token: password_reset_token.token, password: "Password..123"})
        |> json_response(200)

      assert %{"message" => "Password was successfully changed"} = json
      assert [] = Repo.all(PasswordResetToken)
      assert_broadcast "logout", %{logout_from_all_sessions: true}
    end

    test "when new password is same as old", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team, password_hash: Stitch.User.Authentication.hash_password("Password!1"))
      password_reset_token = insert(:password_reset_token, user: user)

      conn =
        conn
        |> with_team_subdomain(team)

      json =
        conn
        |> post(Routes.api_v1_authentication_path(conn, :reset_password), %{token: password_reset_token.token, password: "Password!1"})
        |> json_response(422)

      assert json["errors"]["password"] == ["The new password must be different from the old one"]
      assert [_] = Repo.all(PasswordResetToken)
    end

    test "when the token is used seconds time", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      password_reset_token = insert(:password_reset_token, user: user)

      conn =
        conn
        |> with_team_subdomain(team)

      json =
        conn
        |> post(Routes.api_v1_authentication_path(conn, :reset_password), %{token: password_reset_token.token, password: "Password..123"})
        |> json_response(200)

      assert %{"message" => "Password was successfully changed"} = json

      json =
        conn
        |> post(Routes.api_v1_authentication_path(conn, :reset_password), %{token: password_reset_token.token, password: "Password..123"})
        |> json_response(404)

      assert %{"errors" => "Token is invalid or already used"} = json
    end
  end

  describe "GET /reset-password/:token" do
    test "finds and activates a valid token", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      password_reset_token = insert(:password_reset_token, user: user)

      conn =
        conn
        |> with_team_subdomain(team)

      conn
      |> get(Routes.authentication_path(conn, :change_password, password_reset_token.token))
      |> html_response(200)

      password_reset_token = PasswordResetToken.get_valid_token(password_reset_token.token)
      assert password_reset_token.activated_at != nil
    end

    test "the token is valid but the user belongs to another team", %{conn: conn} do
      team = insert(:team)
      user = insert(:user)
      password_reset_token = insert(:password_reset_token, user: user)

      conn =
        conn
        |> with_team_subdomain(team)

      conn =
        conn
        |> get(Routes.authentication_path(conn, :change_password, password_reset_token.token))

      assert redirected_to(conn, 302) =~ "/login"
      password_reset_token = PasswordResetToken.get_valid_token(password_reset_token.token)
      assert password_reset_token.activated_at == nil
    end

    test "the token doesn't exist", %{conn: conn} do
      team = insert(:team)

      conn =
        conn
        |> with_team_subdomain(team)

      conn =
        conn
        |> get(Routes.authentication_path(conn, :change_password, "token"))

      assert redirected_to(conn, 302) =~ "/login"
    end

    test "password creation's creation date is expired", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      password_reset_token = insert(:password_reset_token, user: user, inserted_at: day_ago())

      conn =
        conn
        |> with_team_subdomain(team)

      conn =
        conn
        |> get(Routes.authentication_path(conn, :change_password, password_reset_token.token))

      assert redirected_to(conn, 302) =~ "/login"
    end

    test "token's activation date is expired", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      password_reset_token = insert(:password_reset_token, user: user, activated_at: half_an_hour_ago())

      conn =
        conn
        |> with_team_subdomain(team)

      conn =
        conn
        |> get(Routes.authentication_path(conn, :change_password, password_reset_token.token))

      assert redirected_to(conn, 302) =~ "/login"
    end
  end

  defp day_ago, do: Timex.shift(NaiveDateTime.utc_now, days: -1)
  defp half_an_hour_ago, do: Timex.shift(NaiveDateTime.utc_now, minutes: -30)
end
