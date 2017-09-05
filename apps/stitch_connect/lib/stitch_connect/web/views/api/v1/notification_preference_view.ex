defmodule StitchConnect.Web.Api.V1.NotificationPreferenceView do
  use StitchConnect.Web, :view

  def render("show_global.json", %{user: user, group_preferences: group_preferences}) do
    %{
      desktop_notification_preference: user.desktop_notification_preference,
      mobile_notification_preference: user.mobile_notification_preference,
      email_notification_preference: user.email_notification_preference,
      group_preferences: group_preferences,
    }
  end

  def render("show.json", %{group_user: group_user}) do
    %{
      desktop_notification_preference: current_preference(group_user, :desktop_notification_preference),
      mobile_notification_preference: current_preference(group_user, :mobile_notification_preference),
    }
  end

  def current_preference(group_user, :desktop_notification_preference), do:
    if group_user.desktop_notification_preference == "default", do: group_user.user.desktop_notification_preference, else: group_user.desktop_notification_preference
  def current_preference(group_user, :mobile_notification_preference), do:
    if group_user.mobile_notification_preference == "default", do: group_user.user.mobile_notification_preference, else: group_user.mobile_notification_preference
end
