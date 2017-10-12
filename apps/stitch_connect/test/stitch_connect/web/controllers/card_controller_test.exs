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

  describe "UPDATE /api/v1/cards/:id" do
  describe "PUT /api/v1/cards/:id" do
    setup %{conn: conn} do
      subscription = insert(:subscription)
      team = subscription.team
      admin_user = insert(:user, team: team, roles: ["admin"])
      card = insert(:card, team: team, default: false)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(admin_user)

      {:ok, conn: conn, team: team, card: card}
    end

    test "can update a card to be the default", %{conn: conn, card: card} do
      params = %{"default" => true}
      conn = put(conn, Routes.api_v1_billing_card_path(conn, :update, card), params)

      assert response = json_response(conn, 200)
      assert response["data"]["default"]
    end

    test "sets other cards to not be the default", %{conn: conn, card: card, team: team} do
      default = insert(:card, team: team, default: true)
      params = %{"default" => true}
      conn = put(conn, Routes.api_v1_billing_card_path(conn, :update, card), params)

      assert json_response(conn, 200)
      refute Stitch.Repo.get(Stitch.Billing.PaymentMethod, default.id).default
    end

    test "requires the `default` params to be set to `true`", %{conn: base_conn, card: card} do
      conn = put(base_conn, Routes.api_v1_billing_card_path(base_conn, :update, card), %{})
      assert response = json_response(conn, 422)
      assert hd(response["errors"]["default"]) =~ ~r"must be .*true"
    end

    test "gives 404 for bad card ids", %{conn: conn} do
      params = %{"default" => true}
      conn = put(conn, Routes.api_v1_billing_card_path(conn, :update, -1), params)

      assert response = json_response(conn, 404)
      assert response["errors"] =~ "does not exist"
    end

    test "requires an admin role", %{conn: conn, team: team, card: card} do
      regular_user = insert(:user, team: team)
      params = %{"default" => true}

      conn =
        conn
        |> with_api_user(regular_user)
        |> put(Routes.api_v1_billing_card_path(conn, :update, card), params)

      assert response = json_response(conn, 401)
      assert response["message"] =~ "administrator"
    end
  end
end
