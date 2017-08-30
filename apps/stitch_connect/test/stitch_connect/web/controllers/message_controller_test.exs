defmodule StitchConnect.Web.MessageControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias Stitch.{MessageQueries}
  import Phoenix.ChannelTest, except: [connect: 2]

  test "POST /api/v1/messages/:id/toggle-star", %{conn: conn} do
    user = insert(:user)
    message = insert(:message, user: user)
    team = message.group.team

    {:ok, socket} = connect_socket(%{user1: user})
    {:ok, socket1: socket}
    @endpoint.subscribe("events:#{user.id}")

    conn = conn
    |> subdomain(team.slug)
    |> post_as_user(user, "/api/v1/messages/#{message.id}/toggle-star")

    json = json_response(conn, 200)
    assert json["starred"] == true

    assert_broadcast "message_starred", %{id: message_id, starred: true}
    assert message_id == message.id

    conn = conn
    |> recycle()
    |> subdomain(team.slug)
    |> post_as_user(user, "/api/v1/messages/#{message.id}/toggle-star")

    assert_broadcast "message_starred", %{id: message_id, starred: false}
    assert message_id == message.id

    json = json_response(conn, 200)
    assert json["starred"] == false
  end

  test "POST /api/v1/messages/:id/toggle-pin", %{conn: conn} do
    user = insert(:user)
    message = insert(:message, user: user)
    insert(:group_user, user: user, group: message.group)
    team = message.group.team

    conn = conn
    |> subdomain(team.slug)
    |> post_as_user(user, "/api/v1/messages/#{message.id}/toggle-pin")

    json = json_response(conn, 200)
    assert json["pinned"] == true
    assert json["pinned_by"]["id"] == user.id
    assert json["pinned_at"] != nil

    conn = conn
    |> recycle()
    |> subdomain(team.slug)
    |> post_as_user(user, "/api/v1/messages/#{message.id}/toggle-pin")

    json = json_response(conn, 200)
    assert json["pinned"] == false
    assert json["pinned_by"] == nil
    assert json["pinned_at"] == nil
  end

  describe "PUT /api/v1/messages/:id" do
    test "user can edit his own text message", %{conn: conn} do
      user = insert(:user)
      message = insert(:message, user: user)
      insert(:group_user, user: user, group: message.group)
      team = message.group.team

      conn = conn
      |> subdomain(team.slug)
      |> put_as_user(user, "/api/v1/messages/#{message.id}", %{
        message: %{
          text_content: "new message text"
        }
      })

      json = json_response(conn, 200)
      assert json["text_content"] == "new message text"
      assert json["edited"] == true
      assert json["edited_at"] != nil
      message = MessageQueries.get_by_id(message.id)
      assert message.text_content == "new message text"
      assert message.edited_at != nil
    end

    test "user can't edit other users' messages", %{conn: conn} do
      user = insert(:user)
      user_eve = insert(:user)
      message = insert(:message, user: user)
      insert(:group_user, user: user, group: message.group)
      insert(:group_user, user: user_eve, group: message.group)
      team = message.group.team

      conn = conn
      |> subdomain(team.slug)
      |> put_as_user(user_eve, "/api/v1/messages/#{message.id}", %{
        message: %{
          text_content: "new message text"
        }
      })

      json = json_response(conn, 401)
      assert json["message"] == "You can't edit other users' messages"
      message = MessageQueries.get_by_id(message.id)
      assert message.text_content == "lorem ipsum"
      assert message.edited_at == nil
    end
  end

  describe "DELETE /api/v1/messages/:id" do
    test "user can delete his own messages", %{conn: conn} do
      user = insert(:user)
      message = insert(:message, user: user)
      insert(:group_user, user: user, group: message.group)
      team = message.group.team

      conn = conn
      |> subdomain(team.slug)
      |> delete_as_user(user, "/api/v1/messages/#{message.id}")

      assert response(conn, 204)
      message = MessageQueries.get_by_id(message.id)
      assert message == nil
    end

    test "user can't delete other users' messages", %{conn: conn} do
      user = insert(:user)
      user_eve = insert(:user)
      message = insert(:message, user: user)
      insert(:group_user, user: user, group: message.group)
      insert(:group_user, user: user_eve, group: message.group)
      team = message.group.team

      conn = conn
      |> subdomain(team.slug)
      |> delete_as_user(user_eve, "/api/v1/messages/#{message.id}")

      json = json_response(conn, 401)
      assert json["message"] == "You can't delete other users' messages"
      assert MessageQueries.get_by_id(message.id) != nil
    end
  end

  describe "POST /api/v1/groups/:group_id/messages" do
    test "default message with text", %{conn: conn} do
      user = insert(:user)
      group = insert(:group)
      insert(:group_user, user: user, group: group)

      conn = conn
      |> subdomain(group.team.slug)
      |> post_as_user(user, "/api/v1/groups/#{group.id}/messages", %{
        message: %{
          type: "user_message",
          text_content: "lorem ipsum"
        }
      })

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

  test "GET /api/v1/groups/:id/messages", %{conn: conn} do
    user = insert(:user)
    message = insert(:message, user: user)
    team = message.group.team

    conn = conn
    |> subdomain(team.slug)
    |> get_as_user(user, "/api/v1/groups/#{message.group.id}/messages")

    json = json_response(conn, 200)
    message = json |> List.first
    assert message["starred"] == false
    assert message["edited"] == false
    assert message["pinned"] == false
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
