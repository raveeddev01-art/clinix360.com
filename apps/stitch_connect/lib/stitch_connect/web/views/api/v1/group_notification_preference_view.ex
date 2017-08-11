defmodule StitchConnect.Web.Api.V1.GroupNotificationPreferenceView do
  use StitchConnect.Web, :view

  def render("show.json", %{group_notification_preference: group_notification_preference}) do
    group_notification_preference_json(group_notification_preference)
  end

  def group_notification_preference_json(preference) do
    %{
      id: preference.id,
      user_id: preference.user_id,
      group_id: preference.group_id,
      setting: preference.setting
    }
  end
end