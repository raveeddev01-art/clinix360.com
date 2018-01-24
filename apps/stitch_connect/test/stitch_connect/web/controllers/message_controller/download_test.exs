defmodule StitchConnect.Web.MessageController.DownloadTest do
  use StitchConnect.Web.ConnCase, async: true
  import StitchConnect.Web.SubdomainRouter.Helpers

  @url "https://s3/amazonaws.com/stitch-connect/some-file"

  describe "GET /api/v1/message/:id/download" do
    setup %{conn: conn} do
      team = insert(:team)
      group = insert(:group, team: team)
      message = insert(:message, type: "upload", fields: %{"url" => @url}, group: group)
      user = insert(:user, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      {:ok, conn: conn, team: team, group: group, message: message}
    end

    test "downloads a message", %{conn: conn, message: message} do
      conn = get(conn, api_v1_message_path(conn, :download, message))
      assert response = json_response(conn, 200)
      assert response["presigned_url"]
    end

    test "restricts guests to downloading messages from groups they are members of", %{conn: conn, team: team, group: group, message: message} do
      other_group = insert(:group, team: team)
      other_message = insert(:message, type: "upload", fields: %{"url" => @url}, group: other_group)

      for role <- ["single-room-guest", "multi-room-guest"] do
        guest = insert(:user, team: team, roles: [role], groups_as_guest: [group.id])
        insert(:group_user, group: group, user: guest)
        base_conn = with_api_user(conn, guest)

        conn = get(base_conn, api_v1_message_path(base_conn, :download, message))
        assert response = json_response(conn, 200)
        assert response["presigned_url"]

        conn = get(base_conn, api_v1_message_path(base_conn, :download, other_message))
        assert response = json_response(conn, :not_found)
        assert response["errors"] =~ "does not exist"
      end
    end
  end
end
