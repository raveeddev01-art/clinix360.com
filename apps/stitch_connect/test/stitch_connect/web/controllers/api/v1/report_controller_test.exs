defmodule StitchConnect.Web.Api.V1.ReportControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: Routes

  describe "POST /api/v1/reports" do
    setup %{conn: conn} do
      team = insert(:team)
      admin_user = insert(:user, team: team, roles: ["admin"])
      conn = with_team_subdomain(conn, team)
      {:ok, conn: conn, team: team, admin_user: admin_user}
    end

    test "requires an admin user", %{conn: conn, team: team} do
      regular_user = insert(:user, team: team)

      conn =
        conn
        |> with_api_user(regular_user)
        |> post(Routes.api_v1_report_path(conn, :create))

      assert response = json_response(conn, 401)
      assert response["message"] =~ "administrator"
    end

    test "with type 'Messages Sent' and time_period 'last 30 days'",
    %{conn: conn, admin_user: user} do
      payload = %{type: "Messages Sent", time_period: "last 30 days"}
      conn =
        conn
        |> with_api_user(user)
        |> post(Routes.api_v1_report_path(conn, :create), payload)

      assert response = json_response(conn, 201)

      data = response["data"]
      assert data["type"]        == "messages_sent"
      assert data["time_period"] == "last_30_days"

      dates = data["body"] |> Map.keys()
      assert length(dates) == 30
    end

    test "with type 'Files Uploaded' and time_period 'last 7 days'",
    %{conn: conn, admin_user: user} do
      payload = %{type: "Files Uploaded", time_period: "last 7 days"}
      conn =
        conn
        |> with_api_user(user)
        |> post(Routes.api_v1_report_path(conn, :create), payload)

      assert response = json_response(conn, 201)

      data = response["data"]
      assert data["type"]        == "files_uploaded"
      assert data["time_period"] == "last_7_days"

      dates = data["body"] |> Map.keys()
      assert length(dates) == 7
    end

    test "with type 'Messages Sent' and time_period 'all time'",
    %{conn: conn, admin_user: user} do
      payload = %{type: "Messages Sent", time_period: "all time"}
      conn =
        conn
        |> with_api_user(user)
        |> post(Routes.api_v1_report_path(conn, :create), payload)

      assert response = json_response(conn, 201)

      data = response["data"]
      assert data["type"]        == "messages_sent"
      assert data["time_period"] == "all_time"

      dates = data["body"] |> Map.keys()
      assert length(dates) == 3
    end

    test "errors with type 'Not Supported' and time_period 'last 7 days'",
    %{conn: conn, admin_user: user} do
      payload = %{type: "Not Supported", time_period: "last 7 days"}
      conn =
        conn
        |> with_api_user(user)
        |> post(Routes.api_v1_report_path(conn, :create), payload)

      assert json_response(conn, 404)
    end

    test "errors with type 'Messages Sent' and time_period 'last 60 days'",
    %{conn: conn, admin_user: user} do
      # note that 'last 60 days' is not a supported time period
      payload = %{type: "Messages Sent", time_period: "last 60 days"}
      conn =
        conn
        |> with_api_user(user)
        |> post(Routes.api_v1_report_path(conn, :create), payload)

      assert json_response(conn, 404)
    end
  end

end
