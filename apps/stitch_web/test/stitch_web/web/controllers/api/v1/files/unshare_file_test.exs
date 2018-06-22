defmodule Stitch.Web.MessageController.UnshareFileTest do
  use Stitch.Web.ConnCase, async: true
  import Stitch.Web.SubdomainRouter.Helpers

  setup %{conn: conn} do
    team = insert(:team)
    user = insert(:user, team: team)
    group = insert(:group, team: team)
    insert(:group_user, group: group, user: user)
    upload = insert(:upload, team: team, user: user)
    private_upload = insert(:upload, team: team, public: false)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(user)
      |> with_api_user(user)

    {:ok, conn: conn, group: group, upload: upload, private_upload: private_upload}
  end

  test "unshares the file from the group", %{conn: conn, group: group, upload: upload} do
    insert(:group_upload, upload: upload, group: group)

    conn
    |> post(api_v1_file_path(conn, :unshare, upload), %{"group_id" => group.id})
    |> json_response(200)
  end

  test "when the file is not shared", %{conn: conn, group: group, upload: upload} do
    response =
      conn
      |> post(api_v1_file_path(conn, :unshare, upload), %{"group_id" => group.id})
      |> json_response(422)

    assert response["message"] == "The file is not shared"
  end

  test "when the user can't access the file", %{conn: conn, group: group, private_upload: upload} do
    response =
      conn
      |> post(api_v1_file_path(conn, :unshare, upload), %{"group_id" => group.id})
      |> json_response(401)

    assert response["message"] == "You are not authorized to access this resource."
  end
end
