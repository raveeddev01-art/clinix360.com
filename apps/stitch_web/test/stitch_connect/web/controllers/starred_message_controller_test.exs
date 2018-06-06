defmodule StitchConnect.Web.StarredMessageControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias Stitch.MessageAction

  describe "GET /api/v1/starred_messages" do
    test "responds with 30 latest ", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      groups =
        fn -> insert(:group, team: team) end
        |> Stream.repeatedly
        |> Enum.take(5)

      [_oldest_starred_message | latest_starred_messages] =
        fn ->
          message = insert(:message, group: Enum.random(groups))
          {:ok, true, _message_action} = MessageAction.toggle_star(message, user)
          message
        end
        |> Stream.repeatedly
        |> Enum.take(31)

      _latest_unstarred_messages =
        fn -> insert(:message, group: Enum.random(groups)) end
        |> Stream.repeatedly
        |> Enum.take(10)

      json =
        conn
        |> subdomain(team.slug)
        |> get_as_user(user, "/api/v1/starred_messages")
        |> json_response(200)

      assert Enum.map(json, &Map.fetch!(&1, "id")) ==
        latest_starred_messages |> Enum.map(&Map.fetch!(&1, :id)) |> Enum.reverse

      Enum.each json, fn starred_message ->
        assert %{
          "id" => _,
          "inserted_at" => _,
          "text_content" => _,
          "user" => %{
            "id" => _,
            "first_name" => _,
            "last_name" => _
          },
          "group_id" => _
        } = starred_message
      end
    end

    test "with limit", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)

      fn ->
        message = insert(:message, group: group)
        {:ok, true, _message_action} = MessageAction.toggle_star(message, user)
        message
      end
      |> Stream.repeatedly
      |> Enum.take(3)

      json =
        conn
        |> subdomain(team.slug)
        |> get_as_user(user, "/api/v1/starred_messages", %{limit: 2})
        |> json_response(200)

      assert Enum.count(json) == 2
    end

    test "with limit > 30", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)

      fn ->
        message = insert(:message, group: group)
        {:ok, true, _message_action} = MessageAction.toggle_star(message, user)
        message
      end
      |> Stream.repeatedly
      |> Enum.take(31)

      json =
        conn
        |> subdomain(team.slug)
        |> get_as_user(user, "/api/v1/starred_messages", %{limit: 31})
        |> json_response(200)

      assert Enum.count(json) == 30
    end

    test "with skip", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)

      starred_messages =
        fn ->
          message = insert(:message, group: group)
          {:ok, true, _message_action} = MessageAction.toggle_star(message, user)
          message
        end
        |> Stream.repeatedly
        |> Enum.take(33)

      unskipped = Enum.take(starred_messages, 31)
      latest_30_unskipped = Enum.take(unskipped, -30)

      json =
        conn
        |> subdomain(team.slug)
        |> get_as_user(user, "/api/v1/starred_messages", %{skip: 2})
        |> json_response(200)

      assert Enum.map(json, &Map.fetch!(&1, "id")) ==
        latest_30_unskipped |> Enum.map(&Map.fetch!(&1, :id)) |> Enum.reverse
    end

    test "with limit and skip", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)

      starred_messages =
        fn ->
          message = insert(:message, group: group)
          {:ok, true, _message_action} = MessageAction.toggle_star(message, user)
          message
        end
        |> Stream.repeatedly
        |> Enum.take(7)

      unskipped = Enum.take(starred_messages, 5)
      latest_two_unskipped = Enum.take(unskipped, -2)

      json =
        conn
        |> subdomain(team.slug)
        |> get_as_user(user, "/api/v1/starred_messages", %{limit: 2, skip: 2})
        |> json_response(200)

      assert Enum.map(json, &Map.fetch!(&1, "id")) ==
        latest_two_unskipped |> Enum.map(&Map.fetch!(&1, :id)) |> Enum.reverse
    end

    test "with limit and skip as strings", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)

      starred_messages =
        fn ->
          message = insert(:message, group: group)
          {:ok, true, _message_action} = MessageAction.toggle_star(message, user)
          message
        end
        |> Stream.repeatedly
        |> Enum.take(7)

      unskipped = Enum.take(starred_messages, 5)
      latest_two_unskipped = Enum.take(unskipped, -2)

      json =
        conn
        |> subdomain(team.slug)
        |> get_as_user(user, "/api/v1/starred_messages", %{limit: "2", skip: "2"})
        |> json_response(200)

      assert Enum.map(json, &Map.fetch!(&1, "id")) ==
        latest_two_unskipped |> Enum.map(&Map.fetch!(&1, :id)) |> Enum.reverse
    end
  end
end
