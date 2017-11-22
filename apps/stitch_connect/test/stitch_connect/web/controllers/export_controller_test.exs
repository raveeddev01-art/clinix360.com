defmodule StitchConnect.Web.ExportControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: Routes

  describe "GET /exports/:id/download" do
    setup %{conn: conn} do
      team = insert(:team)
      admin_user = insert(:user, team: team, roles: ["admin"])
      {:ok, conn: conn, team: team, user: admin_user}
    end

    test "downloads export", %{conn: conn, team: team, user: user} do
      zip_url = "https://sw.amazonaws.com/stitch-exports/some-id.zip"
      export = insert(:export, team: team, zip_url: zip_url)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_user_session(user)
        |> get(Routes.export_path(conn, :download, export.id))

      assert redirected_to(conn) =~ "X-Amz-Signature="
    end

    test "won't download another team's export", %{conn: conn, team: team, user: user} do
      another_team = insert(:team)
      export = insert(:export, team: another_team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_user_session(user)
        |> get(Routes.export_path(conn, :download, export.id))

      assert html_response(conn, 404)
    end

    test "requires an admin role", %{conn: conn, team: team} do
      regular_user = insert(:user, team: team)
      export = insert(:export, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_user_session(regular_user)
        |> get(Routes.export_path(conn, :download, export.id))

      assert html_response(conn, 404)
    end
  end
end
