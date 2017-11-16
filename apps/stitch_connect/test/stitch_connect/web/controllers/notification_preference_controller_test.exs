defmodule StitchConnect.Web.NotificationPreferenceControllerTest do
  use StitchConnect.Web.ConnCase, async: true

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

    test "PUT /users/notification-preference batch update", %{conn: conn} do
      user = insert(:user, desktop_notification_preference: "nothing", mobile_notification_preference: "mentions", email_notification_preference: "hourly")
      message = insert(:message, user: user)
      insert(:group_user, user: user, group: message.group, desktop_notification_preference: "default", mobile_notification_preference: "nothing")
      team = message.group.team

      conn = conn
      |> subdomain(team.slug)
      |> put_as_user(user, "/api/v1/users/notification-preference", %{
        "group_preferences" => [
          %{
            "group_id" => message.group.id,
            "desktop_notification_preference" => "nothing",
            "mobile_notification_preference" => "mentions",
          }
        ]
      })

      json = json_response(conn, 200)
      assert %{"group_preferences" => [group_preference]} = json
      assert %{"desktop_notification_preference" => "nothing", "mobile_notification_preference" => "mentions"} = group_preference

      group_user = Stitch.Repo.get_by(Stitch.GroupUser, user_id: user.id, group_id: message.group.id)
      assert group_user.desktop_notification_preference == "default" # keeps the default value when the new value is the same as global
      assert group_user.mobile_notification_preference == "mentions"
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
