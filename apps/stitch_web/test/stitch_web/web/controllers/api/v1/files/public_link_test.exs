defmodule Stitch.Web.FileController.PublicLinkTest do
  use Stitch.Web.ConnCase, async: true
  import Stitch.Web.SubdomainRouter.Helpers

  alias Stitch.{
    Files.FileQueries
  }

  setup %{conn: conn} do
    team = insert(:team)
    user = insert(:user, team: team)
    group = insert(:group, team: team)
    insert(:group_user, group: group, user: user)
    upload = insert(:upload, team: team, user: user)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(user)
      |> with_api_user(user)

    {:ok, conn: conn, group: group, upload: upload}
  end

  test "creates public token", %{conn: conn, upload: upload} do
    response =
      conn
      |> post(api_v1_file_path(conn, :create_public_link, upload))
      |> json_response(200)

    upload = FileQueries.get_by_id(upload.id)
    assert response["public_token"] == upload.public_token
  end

  test "removes public token", %{conn: conn, upload: upload} do
    response =
      conn
      |> post(api_v1_file_path(conn, :revoke_public_link, upload))
      |> json_response(200)

    assert response["id"] == upload.id
    upload = FileQueries.get_by_id(upload.id)
    assert upload.public_token == nil
  end
end
