defmodule StitchConnect.Web.InvitationControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  import Phoenix.ChannelTest, except: [connect: 2]
  import StitchConnect.Web.SubdomainRouter.Helpers

  setup %{conn: conn} do
    subscription = insert(:subscription)
    team = subscription.team
    group = insert(:group, team: team, is_default: true)
    user = insert(:user, team: team)
    user_b = insert(:user, team: team)
    insert(:group_user, group: group, user: user)
    insert(:group_user, group: group, user: user_b)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_api_user(user)

    @endpoint.subscribe("groups:id:#{group.id}")
    @endpoint.subscribe("events:#{user_b.id}")

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
      |> post(api_v1_invitation_path(conn, :accept, invite.invite_token), %{
        fullname: "Joe",
        username: "Joe",
        password: "Password1",
        pin: "0000",
      })
      |> json_response(422)

    assert json == %{"message" => "Username has invalid format"}
    assert %{accepted: false} = Stitch.Repo.get(Stitch.Invitation, invite.id)
  end

  test "accepts the invite", %{conn: conn, team: team} do
    user = insert(:user, onboarded: false, team: nil)
    invite = insert(:invitation, user: user, team: team)

    json =
      conn
      |> post(api_v1_invitation_path(conn, :accept, invite.invite_token), %{
        fullname: "Joe",
        username: "joe",
        password: "Password1",
        pin: "0000",
      })
      |> json_response(200)

    assert_broadcast "new_msg", new_message_1
    assert_broadcast "new_message", new_message_2
    assert new_message_1.text_content == "{user} joined the room at {time}"
    assert new_message_2.text_content == "{user} joined the room at {time}"

    assert json["onboarded"]
    assert %{accepted: true} = Stitch.Repo.get(Stitch.Invitation, invite.id)
    assert [%{type: "system"}] = Stitch.Repo.all(Stitch.Message)
  end

  test "create/2", %{conn: conn, team: team} do
    current_user = insert(:user, team: team, roles: ["admin"])
    existing_user = insert(:user, team: team)
    deactivated_user = insert(:user, team: team, disabled: true)
    Stitch.Invitation.invite_to_team(current_user.id, "already@invited.com")

    json =
      conn
      |> with_api_user(current_user)
      |> post(api_v1_invitation_path(conn, :create), %{
        "email_collection" => [
          current_user.email,
          current_user.email,
          existing_user.email,
          existing_user.email,
          deactivated_user.email,
          deactivated_user.email,
          "already@invited.com",
          "already@invited.com",
          "not@user.com",
          "not@user.com",
          "furqan@sina.com",
          "furqan@sina.com",
        ] |> Enum.join(",")
      })
      |> json_response(200)

    assert json == %{
      current_user.email => "Email has already been registered.",
      existing_user.email => "Email has already been registered.",
      deactivated_user.email => "Email has already been registered.",
      "already@invited.com" => "Email has already been invited.",
      "not@user.com" => "ok",
      "furqan@sina.com" => "Email host is not supported.",
    }
  end

  test "create/2 when current user is Unauthorized to send invites", %{conn: conn, user: user} do
    json =
      conn
      |> with_api_user(user)
      |> post(api_v1_invitation_path(conn, :create), %{"email_collection" => "not@user.com"})
      |> json_response(:unauthorized)

    assert json["message"] == "Unauthorized to send invites."
  end
end
