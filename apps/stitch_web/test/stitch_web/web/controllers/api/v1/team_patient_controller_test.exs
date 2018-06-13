defmodule Stitch.Web.Api.V1.TeamPatientControllerTest do
  use Stitch.Web.ConnCase, async: true
  alias Stitch.Web.SubdomainRouter.Helpers, as: Routes

  describe "GET /api/v1/patients" do
    setup %{conn: conn} do
      team = insert(:team)
      admin_user = insert(:user, team: team, roles: ["admin"])
      patient = insert(:patient)
      team_patient_a = insert(:team_patient, %{team: team, patient: patient})
      team_patient_b = insert(:team_patient, %{team: team, patient: insert(:patient)})
      # team_patient for other team
      insert(:team_patient, %{team: insert(:team), patient: patient})

      conn = with_team_subdomain(conn, team)

      {:ok, conn: conn, user: admin_user, team_patients: [team_patient_a, team_patient_b]}
    end

    test "returns a list of patients in team", %{
      conn: conn,
      user: user,
      team_patients: team_patients
    } do
      conn =
        conn
        |> with_api_user(user)
        |> get(Routes.api_v1_team_patient_path(conn, :index))

      assert response = json_response(conn, 200)

      response_ids = response |> Enum.map(& &1["id"]) |> Enum.sort()
      team_patient_ids = team_patients |> Enum.map(& &1.id) |> Enum.sort()

      assert response_ids == team_patient_ids
    end
  end
end
