defmodule StitchConnect.SubdomainTest do
  use StitchConnect.Web.ConnCase, async: true

  test "when team doesn't exist", %{conn: conn} do
    team = build(:team)

    conn =
      conn
      |> with_team_subdomain(team)
      |> get("/")

    assert redirected_to(conn, 302) == "http://localhost.app:4001"
  end

  test "when team exists", %{conn: conn} do
    team = insert(:team)

    conn
    |> with_team_subdomain(team)
    |> get("/login")
    |> response(200)
  end
end
