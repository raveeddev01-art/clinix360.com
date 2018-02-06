defmodule StitchConnect.Web.TeamControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: Routes

  describe "GET /api/v1/teams/contact" do
    test "Return team's contact info", %{conn: conn} do
      params = [
        name: "My Name",
        city: "My City",
        state: "CA",
        country: "USA",
        zip_code: "55555-3333",
        company_name: "My Test Company",
        address_line_one: "Street 123, chapel road"
      ]

      team = insert(:team, params)
      admin = insert(:user, team: team, roles: ["admin"])

      json =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(admin)
        |> get(Routes.api_v1_team_path(conn, :show_contact_info, team.id))
        |> json_response(200)

      assert json["name"] == params[:name]
      assert json["city"] == params[:city]
      assert json["state"] == params[:state]
      assert json["country"] == params[:country]
      assert json["zip_code"] == params[:zip_code]
      assert json["company_name"] == params[:company_name]
      assert json["address_line_one"] == params[:address_line_one]
    end
  end

  describe "PUT /api/v1/teams/contact" do
    test "Update team contact info successfully", %{conn: conn} do
      team = insert(:team)
      admin = insert(:user, team: team, roles: ["admin"])

      params = %{
        "name" => "My Name",
        "city" => "My City",
        "state" => "CA",
        "country" => "USA",
        "zip_code" => "55555-333",
        "company_name" => "My Test Company",
        "address_line_one" => "Street 123, chapel road"
      }

      json =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(admin)
        |> put(Routes.api_v1_team_path(conn, :update_contact_info, team.id), params)
        |> json_response(200)

      assert json["name"] == params["name"]
      assert json["city"] == params["city"]
      assert json["state"] == params["state"]
      assert json["country"] == params["country"]
      assert json["zip_code"] == params["zip_code"]
      assert json["company_name"] == params["company_name"]
      assert json["address_line_one"] == params["address_line_one"]
    end

    test "Should throw required fields errors", %{conn: conn} do
      team = insert(:team)
      admin = insert(:user, team: team, roles: ["admin"])

      json =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(admin)
        |> put(Routes.api_v1_team_path(conn, :update_contact_info, team.id), %{})
        |> json_response(422)

      assert message = json["message"]
      assert message =~ "City can't be blank"
      assert message =~ "State can't be blank"
      assert message =~ "Country can't be blank"
      assert message =~ "Zip code can't be blank"
      assert message =~ "Company name can't be blank"
      assert message =~ "Address line one can't be blank"
    end

    test "Should throw country and zip validation errprs", %{conn: conn} do
      team = insert(:team)
      admin = insert(:user, team: team, roles: ["admin"])

      params = %{
        "name" => "My Name",
        "city" => "My City",
        "state" => "CA",
        "country" => "XYZ",
        "zip_code" => "55555",
        "company_name" => "My Test Company",
        "address_line_one" => "Street 123, chapel road"
      }

      json =
        conn
        |> with_team_subdomain(team)
        |> with_api_user(admin)
        |> put(Routes.api_v1_team_path(conn, :update_contact_info, team.id), params)
        |> json_response(422)

      assert message = json["message"]
      assert message =~ "Country is invalid"
      assert message =~ "Zip code has invalid format"
    end
  end
end
