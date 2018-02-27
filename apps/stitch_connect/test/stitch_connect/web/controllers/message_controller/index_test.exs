defmodule StitchConnect.Web.MessageController.IndexTest do
  use StitchConnect.Web.ConnCase, async: true
  import StitchConnect.Web.SubdomainRouter.Helpers

  describe "GET /api/v1/groups/:group_id/message" do
    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)
      insert(:group_user, group: group, user: user)
      message = insert(:message, user: user, group: group)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      {:ok, conn: conn, team: team, user: user, group: group, message: message}
    end

    test "responds with 60 latest messages", %{conn: conn, group: group} do
      [_old_message | latest_messages] =
        fn ->
          insert(
            :message,
            group: group,
            link_previews: [
              %{
                link: "http://foo.bar",
                title: "Foobar",
                description: "Lorem ipsum dolor",
                favicon_url: "http://foo.bar/favicon.ico",
                image_url: "http://foo.bar/logo.png"
              }
            ]
          )
        end
        |> Stream.repeatedly()
        |> Enum.take(61)

      json =
        conn
        |> get(api_v1_message_path(conn, :index, group))
        |> json_response(200)

      assert Enum.map(json, &Map.fetch!(&1, "id")) ==
               latest_messages |> Enum.map(&Map.fetch!(&1, :id)) |> Enum.reverse()

      Enum.each(json, fn message ->
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
                 "link_previews" => [
                   %{
                     "link" => "http://foo.bar",
                     "title" => "Foobar",
                     "description" => "Lorem ipsum dolor",
                     "favicon_url" => "http://foo.bar/favicon.ico",
                     "image_url" => "http://foo.bar/logo.png"
                   }
                 ]
               } = message
      end)
    end

    test "with limit", %{conn: conn, group: group} do
      fn -> insert(:message, group: group) end
      |> Stream.repeatedly()
      |> Enum.take(3)

      json =
        conn
        |> get(api_v1_message_path(conn, :index, group), %{limit: 2})
        |> json_response(200)

      assert Enum.count(json) == 2
    end

    test "with limit > 60", %{conn: conn, group: group} do
      fn -> insert(:message, group: group) end
      |> Stream.repeatedly()
      |> Enum.take(61)

      json =
        conn
        |> get(api_v1_message_path(conn, :index, group), %{limit: 61})
        |> json_response(200)

      assert Enum.count(json) == 60
    end

    test "with skip", %{conn: conn, group: group} do
      messages =
        fn -> insert(:message, group: group) end
        |> Stream.repeatedly()
        |> Enum.take(63)

      unskipped = Enum.take(messages, 61)
      latest_60_unskipped = Enum.take(unskipped, -60)

      json =
        conn
        |> get(api_v1_message_path(conn, :index, group), %{skip: 2})
        |> json_response(200)

      assert Enum.map(json, &Map.fetch!(&1, "id")) ==
               latest_60_unskipped |> Enum.map(&Map.fetch!(&1, :id)) |> Enum.reverse()
    end

    test "with limit and skip", %{conn: conn, group: group} do
      messages =
        fn -> insert(:message, group: group) end
        |> Stream.repeatedly()
        |> Enum.take(7)

      unskipped = Enum.take(messages, 5)
      latest_two_unskipped = Enum.take(unskipped, -2)

      json =
        conn
        |> get(api_v1_message_path(conn, :index, group), %{limit: 2, skip: 2})
        |> json_response(200)

      assert Enum.map(json, &Map.fetch!(&1, "id")) ==
               latest_two_unskipped |> Enum.map(&Map.fetch!(&1, :id)) |> Enum.reverse()
    end

    test "with limit and skip as strings", %{conn: conn, group: group} do
      messages =
        fn -> insert(:message, group: group) end
        |> Stream.repeatedly()
        |> Enum.take(7)

      unskipped = Enum.take(messages, 5)
      latest_two_unskipped = Enum.take(unskipped, -2)

      json =
        conn
        |> get(api_v1_message_path(conn, :index, group), %{limit: "2", skip: "2"})
        |> json_response(200)

      assert Enum.map(json, &Map.fetch!(&1, "id")) ==
               latest_two_unskipped |> Enum.map(&Map.fetch!(&1, :id)) |> Enum.reverse()
    end

    test "doesn't allow to view messages from another team's public group", %{conn: conn} do
      group_b = insert(:group, public: true)

      json =
        conn
        |> get(api_v1_message_path(conn, :index, group_b))
        |> json_response(:not_found)

      assert %{"message" => "The room you are looking for does not exist."} = json
    end

    test "doesn't allow guests to search groups they aren't members of", %{
      conn: conn,
      team: team,
      group: group
    } do
      restricted_group = insert(:group, team: team)

      for role <- ["single-room-guest", "multi-room-guest"] do
        guest = insert(:user, team: team, roles: [role], groups_as_guest: [restricted_group.id])
        insert(:group_user, group: restricted_group, user: guest)

        base_conn = with_api_user(conn, guest)

        conn = get(base_conn, api_v1_message_path(base_conn, :index, restricted_group))
        assert json_response(conn, 200)

        conn = get(base_conn, api_v1_message_path(base_conn, :index, group))
        assert json_response(conn, :not_found)
      end
    end
  end
end