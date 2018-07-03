defmodule StitchConnect.Web.UploadTest do
  use Stitch.Web.ConnCase, async: true
  import Phoenix.ChannelTest, except: [connect: 2]
  import Stitch.Web.SubdomainRouter.Helpers

  alias Stitch.{
    Files.FileQueries
  }

  setup %{conn: conn} do
    team = insert(:team)
    user = insert(:user, team: team)
    private_group = insert(:group, team: team, public: false)
    insert(:group_user, group: private_group, user: user)

    conn =
      conn
      |> with_team_subdomain(team)
      |> with_user_session(user)
      |> with_api_user(user)

    {:ok, conn: conn, private_group: private_group}
  end

  test "Uploading to a private group marks the upload as private", %{
    conn: conn,
    private_group: private_group
  } do
    payload = %{
      message: %{
        type: "upload",
        text_content: "comment",
        fields: %{
          filename: "foobar.pdf",
          mimetype: "pdf",
          size_in_bytes: 123_948,
          url: "url"
        }
      }
    }

    response =
      conn
      |> post(api_v1_message_path(conn, :create, private_group), payload)
      |> json_response(201)

    upload_id = response["upload_id"]
    upload = FileQueries.get_by_id(upload_id)
    assert upload.public == false
  end
end
