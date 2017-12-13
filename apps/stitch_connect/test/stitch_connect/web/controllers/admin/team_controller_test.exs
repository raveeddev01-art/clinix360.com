defmodule StitchConnect.Admin.TeamControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: Routes

  describe "GET /teams" do
    test "lists all teams in DB", %{conn: conn} do
      teams =
        for t <- 1..3 do
          team = insert(:team, name: "team#{t}", slug: "slug#{t}")
          users =
            for u <- 1..t do
              insert(:user, team: team, first_name: "user#{u}")
            end
            {team, users}
        end
      staff_user = insert(:user, is_staff: true)

      conn =
        conn
        |> with_user_session(staff_user)
        |> with_admin_subdomain()
        |> get("/teams")

      assert response = html_response(conn, 200)
      for {team, users} <- teams do
        assert response =~ team.name
        assert response =~ team.slug
        assert response =~ "#{Enum.count(users)}"
      end
    end

    test "lists all users with pagination", %{conn: conn} do
      for t <- 1..6 do
        team = insert(:team, name: "team#{t}", slug: "slug#{t}")
        users =
          for u <- 1..t do
            insert(:user, team: team, first_name: "user#{u}")
          end
          {team, users}
      end
      staff_user = insert(:user, is_staff: true)

      conn =
        conn
        |> with_user_session(staff_user)
        |> with_admin_subdomain()
        |> get(Routes.admin_team_path(conn, :index, page: 2, limit: 3))

      assert response = html_response(conn, 200)
      for i <- 1..3 do
        refute response =~ "team#{i}"
      end
      for i <- 4..6 do
        assert response =~ "team#{i}"
      end
    end
  end
end
