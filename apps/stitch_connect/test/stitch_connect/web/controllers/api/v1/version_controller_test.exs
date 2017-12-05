defmodule StitchConnect.Web.Api.V1.VersionControllerTest do
  use StitchConnect.Web.ConnCase, async: true

  test "GET /api/v1/stitch-version", %{conn: conn} do
    import StitchConnect.Web.SubdomainRouter.Helpers

    team = insert(:team)
    user = insert(:user, team: team)

    json =
      conn
      |> with_team_subdomain(team)
      |> with_api_user(user)
      |> get(api_v1_version_path(conn, :index))
      |> json_response(200)

    assert json == StitchConnect.version
  end
end
