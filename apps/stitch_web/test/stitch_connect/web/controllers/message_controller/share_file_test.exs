defmodule StitchConnect.Web.MessageController.ShareFileTest do
  use Stitch.Web.ConnCase, async: true
  import Stitch.Web.SubdomainRouter.Helpers

  setup %{conn: conn} do
    team = insert(:team)
    user = insert(:user, team: team)
    group = insert(:group, team: team)
    insert(:group_user, group: group, user: user)
    upload = insert(:upload, team: team, user: user)
    another_upload = insert(:upload, team: team)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(user)
      |> with_api_user(user)

    {:ok, conn: conn, group: group, upload: upload, another_upload: another_upload}
  end

  test "shares the file with the group", %{conn: conn, group: group, upload: upload} do
    conn
    |> post(api_v1_message_path(conn, :create, group), %{
      message: %{type: "file_share", upload_id: upload.id}
    })
    |> json_response(201)
  end

  test "can't share a file they don't have access to", %{
    conn: conn,
    group: group,
    another_upload: another_upload
  } do
    response =
      conn
      |> post(api_v1_message_path(conn, :create, group), %{
        message: %{type: "file_share", upload_id: another_upload.id}
      })
      |> json_response(422)

    assert response["message"] == "Upload not found"
  end
end
