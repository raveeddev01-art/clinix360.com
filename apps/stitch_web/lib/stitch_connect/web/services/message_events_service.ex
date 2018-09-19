defmodule StitchConnect.Web.MessageEventsService do
  alias StitchConnect.Web.{
    GroupChannel,
    PushNotifications
  }

  alias Stitch.Web.{
    EventsChannel
  }

  alias Stitch.{
    EmailNotification,
    Mobile.NotificationLogger
  }

  def message_creation_events(message, group, notify_user_ids) do
    NotificationLogger.start(message, notify_user_ids.mobile)

    Stitch.Task.start(fn ->
      GroupChannel.broadcast_message_created(message)
      EventsChannel.broadcast_group_new_msg(group, message, notify_user_ids.desktop)
      PushNotifications.notify_users(group, message, notify_user_ids.mobile)
      PushNotifications.push_badge_update(message, notify_user_ids.mobile)
      EmailNotification.create(message.id, notify_user_ids.email)
    end)
  end

  def message_edit_events(message) do
    GroupChannel.broadcast_message_edited(message)
    Stitch.Elasticsearch.MessageSearch.add_to_index(message)
  end

  def message_delete_events(message) do
    message = Stitch.Repo.preload(message, :group)
    GroupChannel.broadcast_message_deleted(message)
    EventsChannel.broadcast_group_msg_deleted(message.group, message)
    PushNotifications.push_badge_update(message)
    Stitch.Elasticsearch.MessageSearch.delete_from_index(message)
  end
end
