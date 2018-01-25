defmodule StitchConnect.Web.InvitationControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  import Phoenix.ChannelTest, except: [connect: 2]
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "POST /invitations/accept/:token" do
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
      assert new_message_1.text_content == "{user} joined the room at {time}"

      assert json["onboarded"]
      assert %{accepted: true} = Stitch.Repo.get(Stitch.Invitation, invite.id)
      assert [%{type: "system"}] = Stitch.Repo.all(Stitch.Message)
    end
  end

  describe "POST /api/v1/invitations/single-room-guest" do
    setup %{conn: conn} do
      subscription = insert(:subscription, tier: "PREMIUM")
      team = subscription.team
      user = insert(:user, team: team, roles: ["admin"])
      group = insert(:group, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      {:ok, conn: conn, group: group, team: team}
    end

    test "creates an invite", %{conn: conn, group: group} do
      params = %{"email" => "test@test.com", "group_id" => group.id}
      conn = post(conn, api_v1_invitation_path(conn, :invite_single_room_guest), params)
      assert response = json_response(conn, 201)
      assert response["message"] =~ ~r"invitation sent"i
    end

    test "gives error for a bad room id", %{conn: conn} do
      bad_group = insert(:group)
      params = %{"email" => "test@test.com", "group_id" => bad_group.id}
      conn = post(conn, api_v1_invitation_path(conn, :invite_single_room_guest), params)
      assert response = json_response(conn, 422)
      assert hd(response["errors"]["group_id"]) =~ ~r"invalid group id"i
    end

    test "gives error for invalid email format", %{conn: conn, group: group} do
      params = %{"email" => "test", "group_id" => group.id}
      conn = post(conn, api_v1_invitation_path(conn, :invite_single_room_guest), params)
      assert response = json_response(conn, 422)
      assert hd(response["errors"]["email"]) =~ ~r"format"
    end

    test "gives error for missing params", %{conn: conn} do
      conn = post(conn, api_v1_invitation_path(conn, :invite_single_room_guest), %{})
      assert response = json_response(conn, 422)
      assert hd(response["errors"]["email"]) =~ "blank"
      assert hd(response["errors"]["group_id"]) =~ "blank"
    end

    test "gives error when user already exists with same email", %{conn: conn, group: group, team: team} do
      user = insert(:user, team: team)
      params = %{"email" => user.email, "group_id" => group.id}
      conn = post(conn, api_v1_invitation_path(conn, :invite_single_room_guest), params)
      assert response = json_response(conn, 422)
      assert hd(response["errors"]["email"]) =~ "taken"
    end

    test "requires an admin role", %{conn: conn, group: group, team: team} do
      user = insert(:user, team: team, roles: ["member"])
      params = %{"email" => "test@test.com", "group_id" => group.id}
      conn =
        conn
        |> with_api_user(user)
        |> post(api_v1_invitation_path(conn, :invite_single_room_guest), params)
      assert response = json_response(conn, 401)
      assert response["message"] =~ "administrators"
    end

    test "requires at least a Premium subscription", %{conn: conn} do
      subscription = insert(:subscription, tier: "BASIC")
      team = subscription.team
      user = insert(:user, team: team, roles: ["admin"])
      group = insert(:group, team: team)
      params = %{"email" => "test@test.com", "group_id" => group.id}

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)
        |> post(api_v1_invitation_path(conn, :invite_single_room_guest), params)

      assert response = json_response(conn, 403)
      assert response["message"] =~ "requires a higher subscription tier"
    end
  end

  describe "POST /api/v1/invitations/single-room-guests" do
    setup %{conn: conn} do
      subscription = insert(:subscription, tier: "PREMIUM")
      team = subscription.team
      user = insert(:user, team: team, roles: ["admin"])
      group = insert(:group, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      {:ok, conn: conn, group: group, team: team}
    end

    test "creates an invite", %{conn: conn, group: group} do
      params = %{"emails" => ["test@test.com", "test2@test.com"], "group_id" => group.id}
      conn = post(conn, api_v1_invitation_path(conn, :invite_single_room_guests), params)
      assert response = json_response(conn, 201)
      assert %{"test2@test.com" => "ok", "test@test.com" => "ok"} == response
    end

    test "gives error for a bad room id", %{conn: conn} do
      bad_group = insert(:group)
      params = %{"emails" => ["test@test.com", "test2@test.com"], "group_id" => bad_group.id}
      conn = post(conn, api_v1_invitation_path(conn, :invite_single_room_guests), params)
      assert response = json_response(conn, 201)
      assert %{"test2@test.com" => "Invalid group id.", "test@test.com" => "Invalid group id."} == response
    end

    test "gives error for invalid email format", %{conn: conn, group: group} do
      params = %{"emails" => ["test", "test@test.com"], "group_id" => group.id}
      conn = post(conn, api_v1_invitation_path(conn, :invite_single_room_guests), params)
      assert response = json_response(conn, 201)
      assert %{"test" => "Email has invalid format", "test@test.com" => "ok"} == response
    end

    test "gives error for missing params", %{conn: conn} do
      conn = post(conn, api_v1_invitation_path(conn, :invite_single_room_guests), %{})
      assert response = json_response(conn, 201)
      assert response == %{}
    end

    test "gives error when user already exists with same email", %{conn: conn, group: group, team: team} do
      user = insert(:user, team: team)
      params = %{"emails" => [user.email, "test@test.com"], "group_id" => group.id}
      conn = post(conn, api_v1_invitation_path(conn, :invite_single_room_guests), params)
      assert response = json_response(conn, 201)
      assert response[user.email] == "Email has already been taken"
      assert response["test@test.com"] == "ok"
    end

    test "requires an admin role", %{conn: conn, group: group, team: team} do
      user = insert(:user, team: team, roles: ["member"])
      params = %{"emails" => ["test@test.com"], "group_id" => group.id}
      conn =
        conn
        |> with_api_user(user)
        |> post(api_v1_invitation_path(conn, :invite_single_room_guests), params)
      assert response = json_response(conn, 401)
      assert response["message"] =~ "administrators"
    end

    test "requires at least a Premium subscription", %{conn: conn} do
      subscription = insert(:subscription, tier: "BASIC")
      team = subscription.team
      user = insert(:user, team: team, roles: ["admin"])
      group = insert(:group, team: team)
      params = %{"emails" => ["test@test.com"], "group_id" => group.id}

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)
        |> post(api_v1_invitation_path(conn, :invite_single_room_guests), params)

      assert response = json_response(conn, 403)
      assert response["message"] =~ "requires a higher subscription tier"
    end
  end

  describe "POST /api/v1/invitations/multi-room-guest" do
    setup %{conn: conn} do
      subscription = insert(:subscription, tier: "PREMIUM")
      team = subscription.team
      user = insert(:user, team: team, roles: ["admin"])
      group = insert(:group, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      {:ok, conn: conn, group: group, team: team}
    end

    test "creates an invite", %{conn: conn, group: group} do
      params = %{"email" => "test@test.com", "group_ids" => [group.id]}
      conn = post(conn, api_v1_invitation_path(conn, :invite_multi_room_guest), params)
      assert response = json_response(conn, 201)
      assert response["message"] =~ ~r"invitation sent"i
    end

    test "gives error for a bad room id", %{conn: conn, group: group} do
      bad_group = insert(:group)
      params = %{"email" => "test@test.com", "group_ids" => [group.id, bad_group.id]}
      conn = post(conn, api_v1_invitation_path(conn, :invite_multi_room_guest), params)
      assert response = json_response(conn, 422)
      assert hd(response["errors"]["group_ids"]) =~ ~r"invalid group ids"i
    end

    test "requires at least 1 valid group id", %{conn: conn} do
      params = %{"email" => "test@test.com", "group_ids" => []}
      conn = post(conn, api_v1_invitation_path(conn, :invite_multi_room_guest), params)
      assert response = json_response(conn, 422)
      assert hd(response["errors"]["group_ids"]) =~ ~r"at least 1"i
    end

    test "gives error for invalid email format", %{conn: conn, group: group} do
      params = %{"email" => "test", "group_ids" => [group.id]}
      conn = post(conn, api_v1_invitation_path(conn, :invite_multi_room_guest), params)
      assert response = json_response(conn, 422)
      assert hd(response["errors"]["email"]) =~ ~r"format"
    end

    test "gives error for missing params", %{conn: conn} do
      conn = post(conn, api_v1_invitation_path(conn, :invite_multi_room_guest), %{})
      assert response = json_response(conn, 422)
      assert hd(response["errors"]["email"]) =~ "blank"
      assert hd(response["errors"]["group_ids"]) =~ "blank"
    end

    test "gives error when user already exists with same email", %{conn: conn, group: group, team: team} do
      user = insert(:user, team: team)
      params = %{"email" => user.email, "group_ids" => [group.id]}
      conn = post(conn, api_v1_invitation_path(conn, :invite_multi_room_guest), params)
      assert response = json_response(conn, 422)
      assert hd(response["errors"]["email"]) =~ "taken"
    end

    test "requires an admin role", %{conn: conn, group: group, team: team} do
      user = insert(:user, team: team, roles: ["member"])
      params = %{"email" => "test@test.com", "group_ids" => [group.id]}
      conn =
        conn
        |> with_api_user(user)
        |> post(api_v1_invitation_path(conn, :invite_multi_room_guest), params)
      assert response = json_response(conn, 401)
      assert response["message"] =~ "administrators"
    end

    test "requires at least a Premium subscription", %{conn: conn} do
      subscription = insert(:subscription, tier: "BASIC")
      team = subscription.team
      user = insert(:user, team: team, roles: ["admin"])
      group = insert(:group, team: team)
      params = %{"email" => "test@test.com", "group_ids" => [group.id]}

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)
        |> post(api_v1_invitation_path(conn, :invite_multi_room_guest), params)

      assert response = json_response(conn, 403)
      assert response["message"] =~ "requires a higher subscription tier"
    end
  end

  describe "POST /api/v1/invitations/multi-room-guests" do
    setup %{conn: conn} do
      subscription = insert(:subscription, tier: "PREMIUM")
      team = subscription.team
      user = insert(:user, team: team, roles: ["admin"])
      group = insert(:group, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      {:ok, conn: conn, group: group, team: team}
    end

    test "creates an invites", %{conn: conn, group: group} do
      params = %{"emails" => ["test@test.com", "test2@test.com"], "group_ids" => [group.id]}
      conn = post(conn, api_v1_invitation_path(conn, :invite_multi_room_guests), params)
      assert response = json_response(conn, 201)
      assert %{"test2@test.com" => "ok", "test@test.com" => "ok"} == response
    end

    test "gives error for a bad room id", %{conn: conn, group: group} do
      bad_group = insert(:group)
      params = %{"emails" => ["test@test.com", "test2@test.com"], "group_ids" => [group.id, bad_group.id]}
      conn = post(conn, api_v1_invitation_path(conn, :invite_multi_room_guests), params)
      assert response = json_response(conn, 201)
      assert %{ "test2@test.com" => "Invalid group ids", "test@test.com" => "Invalid group ids" } == response
    end

    test "requires at least 1 valid group id", %{conn: conn} do
      params = %{"emails" => ["test@test.com", "test2@test.com"], "group_ids" => []}
      conn = post(conn, api_v1_invitation_path(conn, :invite_multi_room_guests), params)
      assert response = json_response(conn, 201)
      assert %{
        "test@test.com" => "Group ids should have at least 1 item(s)",
        "test2@test.com" => "Group ids should have at least 1 item(s)",
      } == response
    end

    test "gives error for invalid email format", %{conn: conn, group: group} do
      params = %{"emails" => ["test@test.com", "test"], "group_ids" => [group.id]}
      conn = post(conn, api_v1_invitation_path(conn, :invite_multi_room_guests), params)
      assert response = json_response(conn, 201)
      assert %{
        "test@test.com" => "ok",
        "test" => "Email has invalid format"
      } == response
    end

    test "gives error for missing params", %{conn: conn} do
      conn = post(conn, api_v1_invitation_path(conn, :invite_multi_room_guests), %{})
      assert response = json_response(conn, 201)
      assert %{} == response
    end

    test "gives error when user already exists with same email", %{conn: conn, group: group, team: team} do
      user = insert(:user, team: team)
      params = %{"emails" => ["test@test.com", user.email], "group_ids" => [group.id]}
      conn = post(conn, api_v1_invitation_path(conn, :invite_multi_room_guests), params)
      assert response = json_response(conn, 201)
      assert response[user.email] == "Email has already been taken"
      assert response["test@test.com"] == "ok"
    end

    test "requires an admin role", %{conn: conn, group: group, team: team} do
      user = insert(:user, team: team, roles: ["member"])
      params = %{"emails" => ["test@test.com"], "group_ids" => [group.id]}
      conn =
        conn
        |> with_api_user(user)
        |> post(api_v1_invitation_path(conn, :invite_multi_room_guests), params)
      assert response = json_response(conn, 401)
      assert response["message"] =~ "administrators"
    end

    test "requires at least a Premium subscription", %{conn: conn} do
      subscription = insert(:subscription, tier: "BASIC")
      team = subscription.team
      user = insert(:user, team: team, roles: ["admin"])
      group = insert(:group, team: team)
      params = %{"emails" => ["test@test.com"], "group_ids" => [group.id]}

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)
        |> post(api_v1_invitation_path(conn, :invite_multi_room_guests), params)

      assert response = json_response(conn, 403)
      assert response["message"] =~ "requires a higher subscription tier"
    end
  end

  describe "POST /api/v1/invitations" do
    test "creates an invitation", %{conn: conn} do
      team = insert(:team)
      current_user = insert(:user, team: team, roles: ["admin"])
      existing_user = insert(:user, team: team)
      deactivated_user = insert(:user, team: team, disabled: true)
      Stitch.Invitation.invite_to_team(current_user.id, "already@invited.com")

      json =
        conn
        |> with_api_user(current_user)
        |> with_team_subdomain(team)
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
            "furqan@sina.com",
            "furqan@sina.com",
            "not@user.com",
            "not@user.com",
          ] |> Enum.join(",")
        })
        |> json_response(200)

      assert json == %{
        current_user.email => "Email has already been registered.",
        existing_user.email => "Email has already been registered.",
        deactivated_user.email => "Email has already been registered.",
        "already@invited.com" => "Email has already been invited.",
        "furqan@sina.com" => "Email host is not supported.",
        "not@user.com" => "ok",
      }
    end

    test "create/2 when current user is Unauthorized to send invites", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      json =
        conn
        |> with_api_user(user)
        |> with_team_subdomain(team)
        |> post(api_v1_invitation_path(conn, :create), %{"email_collection" => "not@user.com"})
        |> json_response(:unauthorized)

      assert json["message"] == "Unauthorized to send invites."
    end
  end
end
