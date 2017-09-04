defmodule StitchConnect.Web.Api.V1.NotificationPreferenceView do
  use StitchConnect.Web, :view

  def render("show.json", %{user: user, group_preferences: group_preferences}) do
    %{
      desktop_notification_preference: user.desktop_notification_preference,
      mobile_notification_preference: user.mobile_notification_preference,
      email_notification_preference: user.email_notification_preference,
      group_preference: group_preferences,
    }
  end
end