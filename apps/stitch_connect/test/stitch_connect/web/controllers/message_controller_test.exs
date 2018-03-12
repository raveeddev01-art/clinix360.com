defmodule StitchConnect.Web.MessageControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  import Phoenix.ChannelTest, except: [connect: 2]
  import StitchConnect.Web.SubdomainRouter.Helpers
  alias Stitch.{MessageQueries}

  describe "POST /api/v1/groups/:group_id/messages" do
    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)
      insert(:group_user, group: group, user: user)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      {:ok, conn: conn, team: team, user: user, group: group}
    end

    test "default message with text", %{conn: conn, team: team, group: group} do
      user2 = insert(:user, team: team)
      insert(:group_user, user: user2, group: group)

      @endpoint.subscribe("groups:id:#{group.id}")
      @endpoint.subscribe("events:#{user2.id}")

      payload = %{
        message: %{
          type: "user_message",
          text_content: "lorem ipsum"
        }
      }
      conn = post(conn, api_v1_message_path(conn, :create, group), payload)

      assert_broadcast "new_msg", msg_json
      assert_broadcast "new_message", msg2_json
      assert msg_json.text_content == "lorem ipsum"
      assert msg2_json.id == msg_json.id

      assert response = json_response(conn, 201)
      assert response["text_content"] == "lorem ipsum"
      message_id = response["id"]
      message = MessageQueries.get_by_id(message_id)
      assert message.text_content == "lorem ipsum"
    end

    test "message with an attached upload", %{conn: conn, group: group} do
      payload = %{
        message: %{
          type: "upload",
          text_content: "comment",
          fields: %{
            filename: "foobar.pdf",
            mimetype: "pdf",
            size_in_bytes: 123948
          }
        }
      }
      conn = post(conn, api_v1_message_path(conn, :create, group), payload)

      assert response = json_response(conn, 201)
      assert response["fields"]["filename"] == "foobar.pdf"
      message_id = response["id"]
      message = MessageQueries.get_by_id(message_id)
      assert message.fields["filename"] == "foobar.pdf"
    end

    test "whem message is blank", %{conn: conn, group: group} do
      payload = %{
        message: %{
          type: "user_message",
          text_content: ""
        }
      }
      conn = post(conn, api_v1_message_path(conn, :create, group), payload)
      assert response = json_response(conn, 422)
      assert response["message"] == "Text content can't be blank"
    end

    test "when message type isn't suported", %{conn: conn, group: group} do
      payload = %{
        message: %{
          type: "system",
          fields: %{}
        }
      }
      conn = post(conn, api_v1_message_path(conn, :create, group), payload)
      assert response = json_response(conn, 422)
      assert response["message"] == "Type is not supported"
    end

    test "restricts guests from create messages in groups they aren't a member of", %{conn: conn, team: team, group: group} do
      payload = %{
        message: %{
          type: "user_message",
          text_content: "lorem ipsum"
        }
      }
      restricted_group = insert(:group, team: team)
      for role <- ["single-room-guest", "multi-room-guest"] do
        guest = insert(:user, team: team, roles: [role], groups_as_guest: [restricted_group.id])
        insert(:group_user, group: restricted_group, user: guest)

        base_conn = with_api_user(conn, guest)

        conn = post(base_conn, api_v1_message_path(base_conn, :create, restricted_group), payload)
        assert json_response(conn, 201)

        conn = post(base_conn, api_v1_message_path(base_conn, :create, group), payload)
        assert json_response(conn, :forbidden)
      end
    end
  end

  describe "POST /api/v1/messages/search" do
    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)
      insert(:group_user, group: group, user: user)

      insert(:message, user: user, group: group, text_content: "lorem ipsum 1")
      insert(:message, user: user, group: group, text_content: "lorem ipsum 2")
      insert(:message, user: user, group: group, text_content: "lorem ipsum 3")
      insert(:message, user: user, group: group, text_content: "lorem ipsum 4")
      insert(:message, user: user, group: group, text_content: "lorem ipsum 5")
      insert(:message, user: user, group: group, text_content: "lorem ipsum 6")

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      {:ok, conn: conn, group: group, team: team, user: user}
    end

    test "with limit", %{conn: conn} do
      payload = %{
        term: "lorem",
        limit: 2
      }
      conn = post(conn, api_v1_message_path(conn, :search), payload)
      assert response = json_response(conn, 200)
      assert [%{"text_content" => "lorem ipsum 6"}, %{"text_content" => "lorem ipsum 5"}] = response
    end

    test "with limit and skip", %{conn: conn} do
      payload = %{
        term: "lorem",
        limit: 2,
        skip: 2
      }
      conn = post(conn, api_v1_message_path(conn, :search), payload)
      assert response = json_response(conn, 200)
      assert [%{"text_content" => "lorem ipsum 4"}, %{"text_content" => "lorem ipsum 3"}] = response
    end

    test "restricts guest from viewing messages in groups they aren't members of", %{conn: conn, team: team} do
      restricted_group = insert(:group, team: team)
      for role <- ["single-room-guest", "multi-room-guest"] do
        guest = insert(:user, team: team, roles: [role], groups_as_guest: [restricted_group.id])
        insert(:message, user: guest, group: restricted_group, text_content: "test")

        base_conn = with_api_user(conn, guest)

        conn = post(base_conn, api_v1_message_path(base_conn, :search), %{term: "test"})
        assert response = json_response(conn, 200)
        assert length(response)

        conn = post(base_conn, api_v1_message_path(base_conn, :search), %{term: "lorem"})
        assert response = json_response(conn, 200)
        assert length(response) == 0
      end
    end
  end
end
