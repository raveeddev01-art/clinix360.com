defmodule StitchConnect.Web.NotificationPreferenceControllerTest do
  use StitchConnect.Web.ConnCase, async: true

  setup %{conn: conn} do
    conn = %{ conn | host: "localhost" }
    {:ok, conn: conn}
  end

  describe "Global notification preferences" do
    test "GET /users/notification-preference", %{conn: conn} do
      user = insert(:user, desktop_notification_preference: "nothing", mobile_notification_preference: "mentions", email_notification_preference: "hourly")
      group = insert(:group, slug: "general", team: user.team)
      insert(:group_user, user: user, group: group, desktop_notification_preference: "default", mobile_notification_preference: "nothing")

      conn = conn
      |> get_as_user(user, "/api/v1/users/notification-preference")

      json = json_response(conn, 200)
      assert %{
        "desktop_notification_preference" => "nothing",
        "mobile_notification_preference" => "mentions",
        "email_notification_preference" => "hourly",
        "group_preferences" => [%{
          "desktop_notification_preference" => "nothing",
          "mobile_notification_preference" => "nothing"
        }],
      } = json
    end

    test "PUT /users/notification-preference", %{conn: conn} do
      user = insert(:user, desktop_notification_preference: "nothing", mobile_notification_preference: "mentions", email_notification_preference: "hourly")

      conn = conn
      |> put_as_user(user, "/api/v1/users/notification-preference", %{
        "desktop_notification_preference" => "mentions"
      })

      json = json_response(conn, 200)
      assert %{ "desktop_notification_preference" => "mentions" } = json
    end
  end

  describe "Channel-specific notification preferences" do
    test "GET /groups/:group_id/notification-preference", %{conn: conn} do
      user = insert(:user, desktop_notification_preference: "nothing", mobile_notification_preference: "mentions")
      message = insert(:message, user: user)
      insert(:group_user, user: user, group: message.group, desktop_notification_preference: "default", mobile_notification_preference: "nothing")
      team = message.group.team

      conn = conn
      |> subdomain(team.slug)
      |> get_as_user(user, "/api/v1/groups/#{message.group.id}/notification-preference")

      json = json_response(conn, 200)
      assert %{
        "desktop_notification_preference" => "nothing",
        "mobile_notification_preference" => "nothing",
      } = json
    end

    test "PUT /groups/:group_id/notification-preference", %{conn: conn} do
      user = insert(:user, desktop_notification_preference: "nothing", mobile_notification_preference: "mentions")
      message = insert(:message, user: user)
      insert(:group_user, user: user, group: message.group, desktop_notification_preference: "default", mobile_notification_preference: "nothing")
      team = message.group.team

      conn = conn
      |> subdomain(team.slug)
      |> put_as_user(user, "/api/v1/groups/#{message.group.id}/notification-preference", %{
        "desktop_notification_preference" => "mentions"
      })

      json = json_response(conn, 200)
      assert %{
        "desktop_notification_preference" => "mentions"
      } = json
    end
  end
end
