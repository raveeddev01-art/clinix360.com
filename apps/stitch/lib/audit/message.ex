defmodule Stitch.Audit.Message do
  def track_update({:ok, message}, user, message_before_edit) do
    Stitch.Version.insert(message_before_edit, %{
      committed_by_id: message.user_id,
      source: "application"
    })

    Stitch.Version.update(message, %{committed_by_id: user.id, source: "application"})
    {:ok, message}
  end

  def track_update(result, _user, _message), do: result

  def track_delete({:ok, %{message: message}} = result, user) do
    Stitch.Version.insert(message, %{committed_by_id: message.user_id, source: "application"})
    Stitch.Version.delete(message, %{committed_by_id: user.id, source: "application"})
    result
  end

  def track_delete(result, _user), do: result
end
