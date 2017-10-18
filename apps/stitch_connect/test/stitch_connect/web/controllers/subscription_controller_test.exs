defmodule StitchConnect.Web.Api.V1.Billing.SubscriptionControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: Routes

  describe "GET /api/v1/billing/subscription" do
    setup %{conn: conn} do
      subscription = insert(:subscription)
      team = subscription.team
      user = insert(:user, team: team, roles: ["admin"])

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      {:ok, conn: conn, team: team}
    end

    test "shows a subscription", %{conn: conn} do
      conn = get(conn, Routes.api_v1_billing_subscription_path(conn, :show))
      assert response = json_response(conn, 200)
      assert response["data"]["tier"]
      assert response["data"]["valid_until"]
      assert response["data"]["renewal_frequency"] == nil
      assert response["data"]["renews"] == false
      assert response["data"]["estimated_invoice_amount"]
      assert response["data"]["updated_at"]
    end

    test "requires an admin role", %{conn: conn, team: team} do
      regular_user = insert(:user, team: team)

      conn =
        conn
        |> with_api_user(regular_user)
        |> get(Routes.api_v1_billing_subscription_path(conn, :show))

      assert response = json_response(conn, 401)
      assert response["message"] =~ "administrator"
    end
  end

  describe "PUT /api/v1/billing/subscription" do
    test "can convert from a trial to a paid tier", %{conn: conn} do
      subscription = insert(:subscription)
      team = subscription.team
      user = insert(:user, team: team, roles: ["admin"])

      params = %{tier: "BASIC", renewal_frequency: "MONTHLY"}
      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)
        |> put(Routes.api_v1_billing_subscription_path(conn, :update), params)

      assert response = json_response(conn, 200)
      assert response["data"]["renewal_frequency"] == "MONTHLY"
      assert response["data"]["tier"] == "BASIC"
      assert response["data"]["estimated_invoice_amount"]
    end

    test "can convert between paid tiers", %{conn: conn} do
      subscription = insert(:subscription, tier: "BASIC", renewal_frequency: "MONTHLY")
      team = subscription.team
      user = insert(:user, team: team, roles: ["admin"])

      params = %{tier: "POWER", renewal_frequency: "MONTHLY"}
      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)
        |> put(Routes.api_v1_billing_subscription_path(conn, :update), params)

      assert response = json_response(conn, 200)
      assert response["data"]["renewal_frequency"] == "MONTHLY"
      assert response["data"]["tier"] == "POWER"
      assert response["data"]["estimated_invoice_amount"]
    end

    test "gives errors for bad params", %{conn: base_conn} do
      subscription = insert(:subscription)
      team = subscription.team
      user = insert(:user, team: team, roles: ["admin"])

      base_conn =
        base_conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      conn = put(base_conn, Routes.api_v1_billing_subscription_path(base_conn, :update))
      assert response = json_response(conn, 422)
      assert hd(response["errors"]["tier"]) =~ "blank"
      assert hd(response["errors"]["renewal_frequency"]) =~ "blank"

      params = %{tier: "bad", renewal_frequency: "bad"}
      conn = put(base_conn, Routes.api_v1_billing_subscription_path(base_conn, :update), params)
      assert response = json_response(conn, 422)
      assert hd(response["errors"]["tier"]) =~ "expects"
      assert hd(response["errors"]["renewal_frequency"]) =~ "expects"
    end

    test "requires an admin role", %{conn: conn} do
      subscription = insert(:subscription)
      team = subscription.team
      user = insert(:user, team: team, roles: ["member"])

      params = %{tier: "BASIC", renewal_frequency: "MONTHLY"}
      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)
        |> put(Routes.api_v1_billing_subscription_path(conn, :update), params)

      assert response = json_response(conn, 401)
      assert response["message"] =~ "administrator"
    end
  end

  describe "PUT /api/v1/billing/subscription/cancel" do
    setup %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team, roles: ["admin"])

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(user)

      {:ok, conn: conn, team: team}
    end

    test "cancels an active subscription", %{conn: conn, team: team} do
      sub_opts = [team: team, tier: "BASIC", renewal_frequency: "MONTHLY", renews: true]
      insert(:subscription, sub_opts)

      conn = put(conn, Routes.api_v1_billing_subscription_path(conn, :cancel))

      assert response = json_response(conn, 200)
      refute response["data"]["renews"]
    end

    test "cancels an active/non-renewing subscription", %{conn: conn, team: team} do
      sub_opts = [team: team, tier: "BASIC", renewal_frequency: "MONTHLY", renews: false]
      insert(:subscription, sub_opts)

      conn = put(conn, Routes.api_v1_billing_subscription_path(conn, :cancel))

      assert response = json_response(conn, 200)
      refute response["data"]["renews"]
    end

    test "errors when canceling a trial", %{conn: conn, team: team} do
      sub_opts = [team: team, tier: "TRIAL", renews: false]
      insert(:subscription, sub_opts)

      conn = put(conn, Routes.api_v1_billing_subscription_path(conn, :cancel))

      assert response = json_response(conn, 422)
      assert response["errors"] =~ ~r"cannot cancel a trial"i
    end

    test "requires an admin role", %{conn: conn, team: team} do
      sub_opts = [team: team, tier: "BASIC", renewal_frequency: "MONTHLY", renews: true]
      insert(:subscription, sub_opts)
      regular_user = insert(:user, team: team, roles: ["member"])

      conn =
        conn
        |> with_api_user(regular_user)
        |> put(Routes.api_v1_billing_subscription_path(conn, :cancel))

      assert response = json_response(conn, 401)
      assert response["message"] =~ "administrator"
    end
  end
end
