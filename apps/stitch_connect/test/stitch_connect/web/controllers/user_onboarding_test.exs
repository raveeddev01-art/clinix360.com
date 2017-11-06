defmodule StitchConnect.Web.UserOnboardingTest do
  use StitchConnect.Web.ConnCase, async: true
  alias StitchConnect.Web.Router.Helpers, as: Routes
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: SubdomainRoutes
  alias Stitch.Repo
  alias Stitch.Invitation

  describe "PATCH /users/:id/complete-onboarding" do
    setup %{conn: conn} do
      team = insert(:team)
      _group = insert(:group, team: team, is_default: true)
      conn = %Plug.Conn{conn | host: "localhost"}

      {:ok, conn: conn, team: team}
    end

    test "successful onboarding", %{conn: conn, team: team} do
      user = insert(:user, %{email: "user@example.com", onboarded: false})

      conn =
        conn
        |> patch(Routes.api_v1_user_path(conn, :complete_onboarding, user.id), %{
          first_name: "User",
          last_name: "Name",
          username: "username",
          password: "Password1!",
          pin: "0000",
          roles: ["admin"],
          team_id: team.id
        })

      assert response = json_response(conn, 200)
      assert response["id"] == user.id
      assert response["onboarded"] == true
    end

    test "username format is invalid", %{conn: conn, team: team} do
      user = insert(:user, %{email: "user@example.com", onboarded: false})

      conn =
        conn
        |> patch(Routes.api_v1_user_path(conn, :complete_onboarding, user.id), %{
          first_name: "User",
          last_name: "Name",
          username: "Username",
          password: "Password1!",
          pin: "0000",
          roles: ["admin"],
          team_id: team.id
        })

      assert response = json_response(conn, 422)
      assert response["message"] == "Username has invalid format"
    end
  end

  describe "POST /api/v1/invitations/accept/:token" do
    setup %{conn: conn} do
      team = insert(:team)
      _subscription = insert(:subscription, team: team)
      admin = insert(:user, team: team, username: "admin", roles: ["admin"])
      _group = insert(:group, team: team, is_default: true)

      conn =
        conn
        |> with_team_subdomain(team)

      Invitation.invite_to_team(admin.id, "user@example.com")
      assert [invite] = Repo.all(Invitation)

      {:ok, conn: conn, invite: invite}
    end

    test "accepts invitation", %{conn: conn, invite: invite} do
      conn = post(conn, SubdomainRoutes.api_v1_invitation_path(conn, :accept, invite.invite_token), %{
        username: "username",
        pin: "0000",
      })
      assert response = json_response(conn, 200)
      assert response["email"] == "user@example.com"
      assert response["onboarded"] == true
    end

    test "username is already taken", %{conn: conn, invite: invite} do
      conn = post(conn, SubdomainRoutes.api_v1_invitation_path(conn, :accept, invite.invite_token), %{
        username: "admin",
        pin: "0000",
      })
      assert response = json_response(conn, 422)
      assert response["message"] == "Username has already been taken"
    end
  end
end
