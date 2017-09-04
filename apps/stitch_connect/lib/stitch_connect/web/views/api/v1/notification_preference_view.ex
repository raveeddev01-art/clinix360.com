defmodule StitchConnect.Web.Api.V1.NotificationPreferenceView do
  use StitchConnect.Web, :view

  def render("show.json", %{user: user}) do
    %{
      desktop_notification_preference: user.desktop_notification_preference,
      mobile_notification_preference: user.mobile_notification_preference,
      email_notification_preference: user.email_notification_preference,
    }
  end
end