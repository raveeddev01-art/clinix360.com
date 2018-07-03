defmodule Stitch.Web.StarringEventsService do
  alias StitchConnect.Web.{
    GroupChannel
  }

  alias Stitch.{
    Message,
    MessageQueries
  }

  def star_events(%Message{type: "file_share"} = message, user, result) do
    message.upload_id
    |> MessageQueries.file_shares()
    |> Enum.each(fn message ->
      message = Map.put(message, :starred, result)
      GroupChannel.broadcast_message_starred(message, user.id)
    end)
  end

  def star_events(%Message{} = message, user, _result) do
    GroupChannel.broadcast_message_starred(message, user.id)
  end
end
