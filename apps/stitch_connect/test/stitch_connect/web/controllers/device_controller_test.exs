defmodule StitchConnect.Web.DeviceControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  alias Stitch.Mobile

  describe "POST /api/v1/devices" do
    setup %{conn: conn} do
      team = insert(:team)
      bob = insert(:user, team: team)

      conn =
        conn
        |> with_team_subdomain(team)
        |> with_user_session(bob)
        |> with_api_user(bob)

      {:ok, conn: conn, bob: bob}
    end

    test "inserts a new device", %{conn: conn, bob: %{id: user_id} = bob} do
      %{"message" => message} =
        conn
        |> post("/api/v1/devices", %{
          "name" => "Bob's iPad",
          "type" => "ios",
          "token" => "foobarbaz"
        })
        |> json_response(:created)

      assert message == "Mobile device registered"
      assert [%Mobile.Device{
        user_id: ^user_id,
        name: "Bob's iPad",
        type: "ios",
        token: "foobarbaz"
      }] = Mobile.list_user_devices(bob.id)
    end
  end
end
