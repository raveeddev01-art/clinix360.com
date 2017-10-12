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

  describe "POST /api/v1/cards" do
    setup %{conn: conn} do
      subscription = insert(:subscription)
      team = subscription.team
      admin_user = insert(:user, team: team, roles: ["admin"])

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(admin_user)

      {:ok, conn: conn, team: team}
    end

    test "creates a new card", %{conn: conn} do
      body = %{"source_token" => "tok_valid"}
      conn = post(conn, Routes.api_v1_billing_card_path(conn, :create), body)
      assert response = json_response(conn, 201)
      assert response["data"]
    end

    test "requires a source token", %{conn: conn} do
      conn = post(conn, Routes.api_v1_billing_card_path(conn, :create), %{})
      assert response = json_response(conn, 422)
      assert hd(response["errors"]["source_token"]) =~ "blank"
    end

    test "requires a valid source token", %{conn: conn} do
      body = %{"source_token" => "tok_invalid"}
      conn = post(conn, Routes.api_v1_billing_card_path(conn, :create), body)
      assert response = json_response(conn, 422)
      assert hd(response["errors"]["source_token"]) =~ "invalid"
    end

    test "requires an admin role", %{conn: conn, team: team} do
      regular_user = insert(:user, team: team)
      body = %{"source_token" => "tok_valid"}

      conn =
        conn
        |> with_api_user(regular_user)
        |> post(Routes.api_v1_billing_card_path(conn, :create), body)

      assert response = json_response(conn, 401)
      assert response["message"] =~ "administrator"
    end
  end
end
