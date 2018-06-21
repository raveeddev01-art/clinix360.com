defmodule Stitch.Web.MessageController.ShowFileTest do
  use Stitch.Web.ConnCase, async: true
  import Stitch.Web.SubdomainRouter.Helpers

  alias Stitch.{
    Files.Upload
  }

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

  test "shows public file", %{conn: conn, group: group, upload: upload} do
    insert(:group_upload, upload: upload, group: group)

    conn
    |> get(api_v1_file_path(conn, :show, Upload.encode_url_id(upload)))
    |> json_response(200)
  end

  test "redirects to login page if the file is private", %{
    conn: conn,
    private_upload: private_upload
  } do
    conn =
      conn
      |> get(api_v1_file_path(conn, :show, Upload.encode_url_id(private_upload)))

    assert redirected_to(conn, 302) =~ "/login"
  end
end
