defmodule StitchConnect.Web.Api.V1.MentionControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: Routes

  describe "GET /api/v1/mentions" do
    setup %{conn: conn} do
      team = insert(:team)
      group = insert(:group, team: team)
      user = insert(:user, team: team)
      mentioned_user = insert(:user, team: team)
      mentioned_user_ids = [mentioned_user.id]

      max_messages = 50
      messages =
        for i <- 1..max_messages, into: %{} do
          insert(:message, user: mentioned_user, group: group, text_content: "#{i}")
          message = insert(:message, user: user, group: group, text_content: "@#{mentioned_user.username} #{i}", mentioned_user_ids: mentioned_user_ids)
          {i, message}
        end

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(mentioned_user)

      {:ok, conn: conn, messages: messages}
    end

    test "includes pagination metadata", %{conn: conn} do
      query_params = %{"skip" => 5, "limit" => 10}
      result =
        conn
        |> get(Routes.api_v1_mention_path(conn, :index), query_params)
        |> json_response(200)

      assert result["meta"]["count"] == 50
      assert result["meta"]["limit"] == 10
      assert result["meta"]["skip"] == 5
    end

    test "returns the 30 most recent messages by default", %{conn: conn, messages: messages} do
      expected_message_ids = for {index, m} <- messages, index in 20..50, do: m.id

      result =
        conn
        |> get(Routes.api_v1_mention_path(conn, :index))
        |> json_response(200)

      assert length(result["data"]) == 30
      for m <- result["data"] do
        assert m["id"] in expected_message_ids
      end
    end

    test "uses the `limit` param", %{conn: conn, messages: messages} do
      expected_message_id = messages[50].id

      query_params = %{"limit" => 1}
      result =
        conn
        |> get(Routes.api_v1_mention_path(conn, :index), query_params)
        |> json_response(200)

      assert length(result["data"]) == 1
      assert hd(result["data"])["id"] == expected_message_id
    end

    test "uses the `skip` param", %{conn: conn, messages: messages} do
      expected_message_ids = for {index, m} <- messages, index in 10..40, do: m.id

      query_params = %{"skip" => 10}
      result =
        conn
        |> get(Routes.api_v1_mention_path(conn, :index), query_params)
        |> json_response(200)

      assert length(result["data"]) == 30
      for m <- result["data"] do
        assert m["id"] in expected_message_ids
      end
    end

    test "uses the `skip` and `limit` params together", %{conn: conn, messages: messages} do
      expected_message_ids = for {index, m} <- messages, index in 30..40, do: m.id

      query_params = %{"skip" => 10, "limit" => 10}
      result =
        conn
        |> get(Routes.api_v1_mention_path(conn, :index), query_params)
        |> json_response(200)

      assert length(result["data"]) == 10
      for m <- result["data"] do
        assert m["id"] in expected_message_ids
      end
    end
  end
end
