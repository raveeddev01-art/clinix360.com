defmodule StitchConnect.Web.Api.V1.Billing.SubscriptionControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: Routes

  describe "GET /api/v1/subscription" do
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
end
