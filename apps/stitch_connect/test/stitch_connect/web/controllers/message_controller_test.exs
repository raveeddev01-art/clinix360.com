defmodule StitchConnect.Web.MessageControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias Stitch.{MessageQueries}
  import Phoenix.ChannelTest, except: [connect: 2]
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "POST /api/v1/groups/:group_id/messages" do
    test "default message with text", %{conn: conn} do
      user = insert(:user)
      group = insert(:group)
      user2 = insert(:user)
      insert(:group_user, user: user, group: group)
      insert(:group_user, user: user2, group: group)

      @endpoint.subscribe("groups:#{group.slug}")
      @endpoint.subscribe("events:#{user2.id}")

      conn = conn
      |> subdomain(group.team.slug)
      |> post_as_user(user, "/api/v1/groups/#{group.id}/messages", %{
        message: %{
          type: "user_message",
          text_content: "lorem ipsum"
        }
      })

      assert_broadcast "new_msg", msg_json
      assert_broadcast "new_message", msg2_json
      assert msg_json.text_content == "lorem ipsum"
      assert msg2_json.id == msg_json.id

      json = json_response(conn, 201)
      assert json["text_content"] == "lorem ipsum"
      message_id = json["id"]
      message = MessageQueries.get_by_id(message_id)
      assert message.text_content == "lorem ipsum"
    end

    test "message with an attached upload", %{conn: conn} do
      user = insert(:user)
      group = insert(:group)
      insert(:group_user, user: user, group: group)

      conn = conn
      |> subdomain(group.team.slug)
      |> post_as_user(user, "/api/v1/groups/#{group.id}/messages", %{
        message: %{
          type: "upload",
          text_content: "comment",
          fields: %{
            filename: "foobar.pdf",
            mimetype: "pdf",
            size_in_bytes: 123948
          },
        }
      })

      json = json_response(conn, 201)
      assert json["fields"]["filename"] == "foobar.pdf"
      message_id = json["id"]
      message = MessageQueries.get_by_id(message_id)
      assert message.fields["filename"] == "foobar.pdf"
    end

    test "whem message is blank", %{conn: conn} do
      user = insert(:user)
      group = insert(:group)
      insert(:group_user, user: user, group: group)

      conn = conn
      |> subdomain(group.team.slug)
      |> post_as_user(user, "/api/v1/groups/#{group.id}/messages", %{
        message: %{
          type: "user_message",
          text_content: ""
        }
      })

      json = json_response(conn, 422)
      assert json["message"] == "Text content can't be blank"
    end

    test "when message type isn't suported", %{conn: conn} do
      user = insert(:user)
      group = insert(:group)
      insert(:group_user, user: user, group: group)

      conn = conn
      |> subdomain(group.team.slug)
      |> post_as_user(user, "/api/v1/groups/#{group.id}/messages", %{
        message: %{
          type: "system",
          fields: %{}
        }
      })

      json = json_response(conn, 422)
      assert json["message"] == "Type is not supported"
    end
  end

  describe "POST /api/v1/messages/search" do
    test "with limit", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)
      insert(:group_user, user: user, group: group)

      insert(:message, user: user, group: group, text_content: "lorem ipsum 1")
      insert(:message, user: user, group: group, text_content: "lorem ipsum 2")
      insert(:message, user: user, group: group, text_content: "lorem ipsum 3")
      insert(:message, user: user, group: group, text_content: "lorem ipsum 4")
      insert(:message, user: user, group: group, text_content: "lorem ipsum 5")
      insert(:message, user: user, group: group, text_content: "lorem ipsum 6")

      conn = conn
      |> subdomain(team.slug)
      |> post_as_user(user, "/api/v1/messages/search", %{
        term: "lorem",
        limit: 2,
      })

      json = json_response(conn, 200)
      assert [%{"text_content" => "lorem ipsum 6"}, %{"text_content" => "lorem ipsum 5"}] = json
    end

    test "with limit and skip", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)
      insert(:group_user, user: user, group: group)

      insert(:message, user: user, group: group, text_content: "lorem ipsum 1")
      insert(:message, user: user, group: group, text_content: "lorem ipsum 2")
      insert(:message, user: user, group: group, text_content: "lorem ipsum 3")
      insert(:message, user: user, group: group, text_content: "lorem ipsum 4")
      insert(:message, user: user, group: group, text_content: "lorem ipsum 5")
      insert(:message, user: user, group: group, text_content: "lorem ipsum 6")

      conn = conn
      |> subdomain(team.slug)
      |> post_as_user(user, "/api/v1/messages/search", %{
        term: "lorem",
        limit: 2,
        skip: 2,
      })

      json = json_response(conn, 200)
      assert [%{"text_content" => "lorem ipsum 4"}, %{"text_content" => "lorem ipsum 3"}] = json
    end
  end
end
