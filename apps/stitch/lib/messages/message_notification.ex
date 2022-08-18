defmodule Stitch.MessageNotification do
  alias Stitch.{Message, Repo}

  def subscribe_notifications(message, user_id, true) do
    message.notify_user_ids ++ [user_id]
    |> Enum.uniq()
    |> update_notify_ids(message)
  end

  def subscribe_notifications(message, user_id, false) do
    message.notify_user_ids -- [user_id]
    |> update_notify_ids(message)
  end

  def update_parent_notify_user_ids(%{parent_message_id: nil}), do: nil
  def update_parent_notify_user_ids(%{parent_message_id: parent_message_id} = message) do
    Stitch.MessageQueries.get_by_id(parent_message_id)
    |> subscribe_notifications(message.user_id, true)
  end

  defp update_notify_ids(notify_user_ids, message) do
    message
    |> Message.notify_user_ids_changeset(%{notify_user_ids: notify_user_ids})
    |> Repo.update()
  end
end
