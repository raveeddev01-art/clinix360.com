defmodule StitchConnect.Web.NotificationPreferenceControllerTest do
  use StitchConnect.Web.ConnCase, async: true

  describe "Channel-specific notification preferences" do
    test "GET /groups/:group_id/notification-preference", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, desktop_notification_preference: "nothing", mobile_notification_preference: "mentions", team: team)
      group = insert(:group, team: team)
      insert(:group_user, user: user, group: group, desktop_notification_preference: "default", mobile_notification_preference: "nothing")

      conn = conn
      |> subdomain(team.slug)
      |> get_as_user(user, "/api/v1/groups/#{group.id}/notification-preference")

      json = json_response(conn, 200)
      assert %{
        "desktop_notification_preference" => "nothing",
        "mobile_notification_preference" => "nothing",
      } = json
    end

    test "PUT /groups/:group_id/notification-preference", %{conn: conn} do
      team = insert(:team)
      user = insert(:user, team: team, desktop_notification_preference: "nothing", mobile_notification_preference: "mentions")
      group = insert(:group)
      insert(:group_user, user: user, group: group, desktop_notification_preference: "default", mobile_notification_preference: "nothing")

      conn = conn
      |> subdomain(team.slug)
      |> put_as_user(user, "/api/v1/groups/#{group.id}/notification-preference", %{
        "desktop_notification_preference" => "mentions"
      })

      json = json_response(conn, 200)
      assert %{
        "desktop_notification_preference" => "mentions"
      } = json
    end
  end
end
