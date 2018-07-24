defmodule StitchConnect.Web.MessageController.ShareFileTest do
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

  test "shares the file with the group", %{conn: conn, group: group, upload: upload} do
    insert(:group_upload, upload: upload, group: group)

    conn
    |> post(api_v1_file_path(conn, :share, upload), %{
      group_id: group.id,
      text_content: "Testing file sharing"
    })
    |> json_response(200)
  end

  test "can't share a file they don't have access to", %{
    conn: conn,
    group: group,
    private_upload: private_upload
  } do
    response =
      conn
      |> post(api_v1_file_path(conn, :share, private_upload), %{
        group_id: group.id,
        text_content: "Testing file sharing"
      })
      |> json_response(401)

    assert response["message"] == "You are not authorized to access this resource."
  end
end
