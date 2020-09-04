defmodule Stitch.Web.Api.V1.PatientControllerTest do
  use Stitch.Web.ConnCase, async: true
  alias Stitch.Web.SubdomainRouter.Helpers, as: Routes

  describe "GET /api/v1/patients" do
    setup %{conn: conn} do
      team = insert(:team)
      admin_user = insert(:user, team: team, roles: ["admin"])
      patient_a = insert(:patient, %{team: team})
      patient_b = insert(:patient, %{team: team})
      # patient for other team
      insert(:patient, %{team: insert(:team)})

      conn = with_team_subdomain(conn, team)

      {:ok, conn: conn, user: admin_user, patients: [patient_a, patient_b]}
    end

    # test "returns a list of patients in team", %{
    #   conn: conn,
    #   user: user,
    #   patients: patients
    # } do
    #   conn =
    #     conn
    #     |> with_api_user(user)
    #     |> get(Routes.api_v1_patient_path(conn, :index))

    #   assert response = json_response(conn, 200)

    #   response_ids = response["patients"] |> Enum.map(& &1["id"]) |> Enum.sort()
    #   patient_ids = patients |> Enum.map(& &1.id) |> Enum.sort()

    #   assert response_ids == patient_ids
    # end
  end
end
