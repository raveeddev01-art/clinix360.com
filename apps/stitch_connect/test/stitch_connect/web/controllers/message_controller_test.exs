defmodule StitchConnect.Web.MessageControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias Stitch.{MessageQueries}
  import Phoenix.ChannelTest, except: [connect: 2]
  import StitchConnect.Web.SubdomainRouter.Helpers

  test "POST /api/v1/messages/:id/toggle-star", %{conn: conn} do
    team = insert(:team)
    user = insert(:user, team: team)
    group = insert(:group, team: team)
    message = insert(:message, user: user, group: group)

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

      @endpoint.subscribe("groups:#{message.group.slug}")

      conn = conn
      |> subdomain(team.slug)
      |> put_as_user(user, "/api/v1/messages/#{message.id}", %{
        message: %{
          text_content: "new message text"
        }
      })

      assert_broadcast "edit_msg", message
      assert message.text_content == "new message text"

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
      user2 = insert(:user)
      insert(:group_user, user: user, group: message.group)
      insert(:group_user, user: user2, group: message.group)
      team = message.group.team

      @endpoint.subscribe("groups:#{message.group.slug}")
      @endpoint.subscribe("events:#{user2.id}")

      conn = conn
      |> subdomain(team.slug)
      |> delete_as_user(user, "/api/v1/messages/#{message.id}")

      assert_broadcast "delete_msg", %{id: msg_id}
      assert_broadcast "message_deleted", %{id: msg2_id}
      assert msg_id == message.id
      assert msg2_id == message.id

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

  describe "GET /api/v1/groups/:id/messages" do
    test "responds with 30 latest messages", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)

      [_old_message | latest_messages] =
        fn -> insert(:message, group: group) end
        |> Stream.repeatedly
        |> Enum.take(31)

      json =
        conn
        |> subdomain(group.team.slug)
        |> get_as_user(user, "/api/v1/groups/#{group.id}/messages")
        |> json_response(200)

      assert Enum.map(json, &Map.fetch!(&1, "id")) ==
        latest_messages |> Enum.map(&Map.fetch!(&1, :id)) |> Enum.reverse

      Enum.each json, fn message ->
        assert %{
          "id" => _,
          "user_id" => _,
          "user" => %{"first_name" => _, "id" => _, "last_name" => _},
          "group_id" => _,
          "deleted" => _,
          "text_content" => _,
          "fields" => _,
          "type" => _,
          "inserted_at" => _,
          "starred" => _,
          "pinned" => _,
          "pinned_by" => _,
          "pinned_at" => _,
          "edited" => _,
          "edited_at" => _,
          "read_status" => _,
        } = message
      end
    end

    test "with limit", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)

      fn -> insert(:message, group: group) end
      |> Stream.repeatedly
      |> Enum.take(3)

      json =
        conn
        |> subdomain(group.team.slug)
        |> get_as_user(user, "/api/v1/groups/#{group.id}/messages", %{limit: 2})
        |> json_response(200)

      assert Enum.count(json) == 2
    end

    test "with limit > 30", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)

      fn -> insert(:message, group: group) end
      |> Stream.repeatedly
      |> Enum.take(31)

      json =
        conn
        |> subdomain(group.team.slug)
        |> get_as_user(user, "/api/v1/groups/#{group.id}/messages", %{limit: 31})
        |> json_response(200)

      assert Enum.count(json) == 30
    end

    test "with skip", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)

      messages =
        fn -> insert(:message, group: group) end
        |> Stream.repeatedly
        |> Enum.take(33)

      unskipped = Enum.take(messages, 31)
      latest_30_unskipped = Enum.take(unskipped, -30)

      json =
        conn
        |> subdomain(group.team.slug)
        |> get_as_user(user, "/api/v1/groups/#{group.id}/messages", %{skip: 2})
        |> json_response(200)

      assert Enum.map(json, &Map.fetch!(&1, "id")) ==
        latest_30_unskipped |> Enum.map(&Map.fetch!(&1, :id)) |> Enum.reverse
    end

    test "with limit and skip", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)

      messages =
        fn -> insert(:message, group: group) end
        |> Stream.repeatedly
        |> Enum.take(7)

      unskipped = Enum.take(messages, 5)
      latest_two_unskipped = Enum.take(unskipped, -2)

      json =
        conn
        |> subdomain(group.team.slug)
        |> get_as_user(user, "/api/v1/groups/#{group.id}/messages", %{limit: 2, skip: 2})
        |> json_response(200)

      assert Enum.map(json, &Map.fetch!(&1, "id")) ==
        latest_two_unskipped |> Enum.map(&Map.fetch!(&1, :id)) |> Enum.reverse
    end

    test "with limit and skip as strings", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)

      messages =
        fn -> insert(:message, group: group) end
        |> Stream.repeatedly
        |> Enum.take(7)

      unskipped = Enum.take(messages, 5)
      latest_two_unskipped = Enum.take(unskipped, -2)

      json =
        conn
        |> subdomain(group.team.slug)
        |> get_as_user(user, "/api/v1/groups/#{group.id}/messages", %{limit: "2", skip: "2"})
        |> json_response(200)

      assert Enum.map(json, &Map.fetch!(&1, "id")) ==
        latest_two_unskipped |> Enum.map(&Map.fetch!(&1, :id)) |> Enum.reverse
    end

    test "doesn't allow to view messages from another team's public group", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group_a = insert(:group, team: team)

      group_b = insert(:group, public: true)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_user_session(user)
        |> with_api_user(user)

      json =
        conn
        |> get(api_v1_message_path(conn, :index, group_b))
        |> json_response(401)

      assert %{"message" => "You can't see the messages for this room."} = json
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
