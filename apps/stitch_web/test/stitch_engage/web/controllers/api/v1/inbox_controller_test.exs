defmodule Stitch.Web.Api.V1.InboxControllerTest.SetupHelper do
  use Stitch.Web.ConnCase, async: true

  def setup(conn) do
    team = insert(:team)
    insert(:team_feature, name: "engage", team: team)
    patient = insert(:patient, team: team)
    admin_user = insert(:user, team: team, roles: ["admin"])
    guest_user = insert(:user, team: team, roles: ["single-room-guest"])
    inbox = insert(:inbox, team: team, name: "team default")

    conn = with_team_subdomain(conn, team)

    {:ok,
     conn: conn, inbox: inbox, admin_user: admin_user, guest_user: guest_user, patient: patient}
  end
end

defmodule Stitch.Web.Api.V1.InboxControllerTest do
  use Stitch.Web.ConnCase, async: true
  alias Stitch.Web.SubdomainRouter.Helpers, as: Routes
  alias Stitch.Web.Api.V1.InboxControllerTest.SetupHelper

  describe "GET /api/v1/inboxes/default" do
    setup %{conn: conn} do
      SetupHelper.setup(conn)
    end

    test "shows the default inbox", setup_params do
      conn =
        setup_params.conn
        |> with_api_user(setup_params.admin_user)
        |> get(Routes.api_v1_inbox_path(setup_params.conn, :default))

      assert response = json_response(conn, 200)
      assert response["name"] == "team default"
    end

    test "errors if not authorized", setup_params do
      conn =
        setup_params.conn
        |> with_api_user(setup_params.guest_user)
        |> get(Routes.api_v1_inbox_path(setup_params.conn, :default))

      assert conn.status == 403
    end
  end

  describe "GET /api/v1/patient/inboxes/default" do
    setup %{conn: conn} do
      SetupHelper.setup(conn)
    end

    test "shows the default inbox", setup_params do
      conn =
        setup_params.conn
        |> with_api_user(setup_params.patient)
        |> get(Routes.api_v1_inbox_path(setup_params.conn, :patient_default))

      assert response = json_response(conn, 200)
      assert response["name"] == "team default"
    end
  end

  describe "PUT /api/v1/inboxes/:id" do
    setup %{conn: conn} do
      SetupHelper.setup(conn)
    end

    test "updates an inbox properly", setup_params do
      conn =
        setup_params.conn
        |> with_api_user(setup_params.admin_user)
        |> put(Routes.api_v1_inbox_path(setup_params.conn, :update, setup_params.inbox.id), %{
          name: "new name"
        })

      assert response = json_response(conn, 200)
      assert response["name"] == "new name"
    end

    test "errors if not authorized", setup_params do
      conn =
        setup_params.conn
        |> with_api_user(setup_params.guest_user)
        |> put(Routes.api_v1_inbox_path(setup_params.conn, :update, setup_params.inbox.id), %{
          name: "new name"
        })

      assert conn.status == 403
    end

    test "errors if not found", setup_params do
      conn =
        setup_params.conn
        |> with_api_user(setup_params.admin_user)
        |> put(
          Routes.api_v1_inbox_path(setup_params.conn, :update, setup_params.inbox.id + 111),
          %{
            name: "new name"
          }
        )

      assert conn.status == 404
    end
  end
end
