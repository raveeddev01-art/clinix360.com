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

    test "renders errors when data is invalid", %{conn: conn} do
      json =
        conn
        |> post("/api/v1/devices", %{})
        |> json_response(:unprocessable_entity)

      assert json == %{
        "errors" => %{
          "name" => ["can't be blank"],
          "token" => ["can't be blank"]
        },
        "message" => "name can't be blank, and token can't be blank"
      }
    end
  end
end
