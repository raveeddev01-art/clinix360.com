defmodule Stitch.Audit.ConversationMessage do
  def track_update({:ok, conversation_message}, provider_id, conversation_message_before_edit) do
    # This does not support patient edits. - We may or may not want to allow this in the future.
    Stitch.Version.insert(conversation_message_before_edit, %{
      committed_by_id: provider_id,
      source: "application"
    })

    Stitch.Version.update(conversation_message, %{
      committed_by_id: provider_id,
      source: "application"
    })

    {:ok, conversation_message}
  end

  def track_update(result, _provider_id, _conversation_message), do: result

  def track_delete({:ok, %{conversation_message: conversation_message}} = result, provider_id) do
    # This does not support patient deletes. - We may or may not want to allow this in the future.
    Stitch.Version.insert(conversation_message, %{
      committed_by_id: conversation_message.provider_id,
      source: "application"
    })

    Stitch.Version.delete(conversation_message, %{
      committed_by_id: provider_id,
      source: "application"
    })

    result
  end

  def track_delete(result, _user), do: result
end
