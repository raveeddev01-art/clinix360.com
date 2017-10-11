defmodule StitchConnect.Web.Api.V1.Billing.CardControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: Routes

  describe "GET /api/v1/cards" do
    setup %{conn: conn} do
      subscription = insert(:subscription)
      team = subscription.team
      admin_user = insert(:user, team: team, roles: ["admin"])
      cards =
        for _ <- 1..4 do
          insert(:card, team: team)
        end
      cards = cards ++ [insert(:card, team: team, default: true)]
      conn = with_team_subdomain(conn, team)

      {:ok, conn: conn, team: team, admin_user: admin_user, cards: cards}
    end

    test "lists all the cards belonging to a team", %{conn: conn, admin_user: user, cards: cards} do
      conn =
        conn
        |> with_api_user(user)
        |> get(Routes.api_v1_billing_card_path(conn, :index))
      assert response = json_response(conn, 200)
      assert length(response["data"]) == length(cards)
    end

    test "requires an admin user", %{conn: conn, team: team} do
      regular_user = insert(:user, team: team)

      conn =
        conn
        |> with_api_user(regular_user)
        |> get(Routes.api_v1_billing_card_path(conn, :index))

      assert response = json_response(conn, 401)
      assert response["message"] =~ "administrator"
    end
  end
end
