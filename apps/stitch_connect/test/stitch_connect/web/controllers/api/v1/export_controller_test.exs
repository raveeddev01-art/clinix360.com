defmodule StitchConnect.Web.Api.V1.ExportControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: Routes

  describe "GET /api/v1/exports" do
    setup %{conn: conn} do
      team = insert(:team)
      export_1 = insert(:export, team: team)
      export_2 = insert(:export, team: team)
      admin_user = insert(:user, team: team, roles: ["admin"])
      exports = [export_1, export_2]

      conn = with_team_subdomain(conn, team)

      {:ok, conn: conn, team: team, admin_user: admin_user, exports: exports}
    end

    test "lists all the exports of a given type belonging to a team",
    %{conn: conn, admin_user: user, exports: exports} do
      conn =
        conn
        |> with_api_user(user)
        |> get(Routes.api_v1_export_path(conn, :index))

      assert response = json_response(conn, 200)
      assert length(response) == length(exports)
    end

    test "requires an admin user", %{conn: conn, team: team} do
      regular_user = insert(:user, team: team)

      conn =
        conn
        |> with_api_user(regular_user)
        |> get(Routes.api_v1_export_path(conn, :index))

      assert response = json_response(conn, 401)
      assert response["message"] =~ "administrator"
    end
  end

  describe "POST /api/v1/exports" do
    setup %{conn: conn} do
      team = insert(:team)
      admin_user = insert(:user, team: team, roles: ["admin"])

      conn = with_team_subdomain(conn, team)

      {:ok, conn: conn, user: admin_user, team: team}
    end

    test "creates a new export", %{conn: conn, user: user} do
      conn =
        conn
        |> with_api_user(user)
        |> post(Routes.api_v1_export_path(conn, :create))

      assert response = json_response(conn, 200)
      assert response["data"]["id"]
      assert response["data"]["inserted_at"]
      assert response["data"]["status"] == "PROCESSING"
    end

    test "requires an admin role", %{conn: conn, team: team} do
      regular_user = insert(:user, team: team)

      conn =
        conn
        |> with_api_user(regular_user)
        |> post(Routes.api_v1_export_path(conn, :create))

      assert response = json_response(conn, 401)
      assert response["message"] =~ "administrator"
    end

    test "with export in the last 24 hrs", %{conn: conn, user: user, team: team}  do
      now = NaiveDateTime.utc_now()
      ten_hours_ago = NaiveDateTime.add(now, -36_000, :second)
      insert(:export, team: team, inserted_at: ten_hours_ago)

      conn =
        conn
        |> with_api_user(user)
        |> post(Routes.api_v1_export_path(conn, :create))

      assert response = json_response(conn, 429)
      assert response["message"] =~ "24 hour period"
    end
  end

end
