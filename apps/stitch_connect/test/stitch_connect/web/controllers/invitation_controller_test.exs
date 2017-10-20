defmodule StitchConnect.Web.InvitationControllerTest do
  use StitchConnect.Web.ConnCase
  import StitchConnect.Web.SubdomainRouter.Helpers

  setup %{conn: conn} do
    team = insert(:team)
    group = insert(:group, team: team, is_default: true)
    user = insert(:user, team: team)
    insert(:group_user, group: group, user: user)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(user)
      |> with_api_user(user)

    {:ok, conn: conn, group: group, team: team, user: user}
  end

  test "given token doesn't exists", %{conn: conn} do
    json =
      conn
      |> post(api_v1_invitation_path(conn, :accept, "42"))
      |> json_response(422)

    assert json == %{"message" => "Invitation does not exist."}
  end

  test "username is invalid", %{conn: conn, team: team} do
    user = insert(:user, onboarded: false)
    invite = insert(:invitation, user: user, team: team)

    json =
      conn
      |> post(api_v1_invitation_path(conn, :accept, invite.invite_token, %{
        fullname: "Test",
        username: "Test",
        password: "Password1",
        pin: "0000",
      }))
      |> json_response(422)

    assert json == %{"message" => "Could not finish onboarding user."}
    assert %{accepted: false} = Stitch.Repo.get(Stitch.Invitation, invite.id)
  end

  test "accepts the invite", %{conn: conn, team: team} do
    user = insert(:user, onboarded: false)
    invite = insert(:invitation, user: user, team: team)

    json =
      conn
      |> post(api_v1_invitation_path(conn, :accept, invite.invite_token, %{
        fullname: "Test",
        username: "test",
        password: "Password1",
        pin: "0000",
      }))
      |> json_response(200)

    assert json["onboarded"]
    assert %{accepted: true} = Stitch.Repo.get(Stitch.Invitation, invite.id)
    assert [%{type: "system"}] = Stitch.Repo.all(Stitch.Message)
  end
end
