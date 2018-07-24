defmodule Stitch.Web.FileController.DeleteCommentTest do
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

    {:ok, conn: conn, user: user, upload: upload, private_upload: private_upload}
  end

  test "deletes comment", %{conn: conn, user: user, upload: upload} do
    upload_comment = insert(:upload_comment, upload: upload, user: user)

    response =
      conn
      |> put(api_v1_file_comment_path(conn, :delete, upload_comment.id), %{
        "file_comment" => %{"text_content" => "test"}
      })
      |> json_response(200)

    assert response["text_content"] == "test"
  end

  test "unauthorized access", %{conn: conn, upload: upload} do
    upload_comment = insert(:upload_comment, upload: upload)

    conn
    |> put(api_v1_file_comment_path(conn, :update, upload_comment.id), %{
      "file_comment" => %{"text_content" => "test"}
    })
    |> json_response(404)
  end
end
