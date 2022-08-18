defmodule Stitch.FilesPreviewGenerator do
  @moduledoc """
  Generates files previews for messages.

  Worker is started w/ application.
  """

  use GenServer
  alias Stitch.Files.Upload
  alias Stitch.{Repo, Message, MessageQueries}
  alias Stitch.Engage.{Conversation, ConversationMessage, ConversationQueries}
  alias StitchConnect.Web.GroupChannel
  use Appsignal.Instrumentation.Decorators

  def start_link do
    GenServer.start_link(
      __MODULE__,
      [],
      name: __MODULE__
    )
  end

  def queue(message) do
    GenServer.cast(__MODULE__, {:queue, message})
  end

  def init(messages) do
    queue = :queue.from_list(messages)
    schedule_queue_processing()
    {:ok, queue}
  end

  def handle_cast({:queue, message}, queue) do
    {:noreply, :queue.in(message, queue)}
  end

  def handle_info(:process_queue, queue) do
    queue = process_queue(queue)
    schedule_queue_processing()
    {:noreply, queue}
  end

  @decorate transaction(:background_job)
  def process_queue(queue) do
    case :queue.out(queue) do
      {{:value, %Message{} = message}, queue} ->
        with "file_share" <- Map.get(message, :type),
             preview_generated_feilds <- Upload.create_previews(message.fields, []) do
          Message.update_fields(preview_generated_feilds, message)
        end

        case message.parent_message_id do
          nil ->
            MessageQueries.get_by_id(message.id)
            |> GroupChannel.broadcast_message_updated()

          parent_message_id ->
            MessageQueries.get_by_id(parent_message_id)
            |> GroupChannel.broadcast_message_comment_edited()
        end

        queue

      {:empty, queue} ->
        queue
    end
  end

  defp schedule_queue_processing do
    Process.send_after(self(), :process_queue, 500)
  end
end
