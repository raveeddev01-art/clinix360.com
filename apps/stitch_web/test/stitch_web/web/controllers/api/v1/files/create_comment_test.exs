defmodule Stitch.Web.FileController.CreateCommentTest do
  use Stitch.Web.ConnCase, async: true
  import Stitch.Web.SubdomainRouter.Helpers

  alias Stitch.{
    Files.Upload,
    Files.FileQueries
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

    {:ok, conn: conn, upload: upload, private_upload: private_upload}
  end

  test "creates comment", %{conn: conn, upload: upload} do
    response =
      conn
      |> post(api_v1_file_comment_path(conn, :create, upload), %{
        "file_comment" => %{"text_content" => "test"}
      })
      |> json_response(201)

    assert response["text_content"] == "test"
  end

  test "unauthorized access", %{conn: conn, private_upload: private_upload} do
    conn
    |> post(api_v1_file_comment_path(conn, :create, private_upload), %{
      "file_comment" => %{"text_content" => "test"}
    })
    |> json_response(404)
  end
end
