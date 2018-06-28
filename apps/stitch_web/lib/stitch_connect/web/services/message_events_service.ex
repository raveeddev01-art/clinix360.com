defmodule StitchConnect.Web.MessageEventsService do
  alias StitchConnect.Web.{
    EventsChannel,
    GroupChannel,
    PushNotifications
  }

  alias Stitch.{
    LinkPreviewGenerator
  }

  def message_events(message, group, notify_user_ids) do
    Stitch.Mobile.NotificationLogger.start(message, notify_user_ids.mobile)

    Stitch.Task.start(fn ->
      LinkPreviewGenerator.queue(message)
      GroupChannel.broadcast_message_created(message)
      EventsChannel.broadcast_group_new_msg(group, message, notify_user_ids.desktop)
      PushNotifications.notify_users(group, message, notify_user_ids.mobile)
      PushNotifications.push_badge_update(message, notify_user_ids.mobile)
      Stitch.EmailNotification.create(message.id, notify_user_ids.email)
    end)
  end
end
