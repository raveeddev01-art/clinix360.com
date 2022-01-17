defmodule Stitch.LinkPreviewGenerator do
  @moduledoc """
  Generates link previews for both messages and conversation messages.

  Worker is started w/ application if "start_message_link_preview_generator"
  env var is set.
  """

  use GenServer
  alias Stitch.Message.LinkPreview
  alias Stitch.{Repo, Message, GroupQueries, MessageQueries}
  alias Stitch.Engage.{Conversation, ConversationMessage, ConversationQueries}
  alias StitchConnect.Web.GroupChannel
  alias StitchEngage.Web.ConversationChannel
  use Appsignal.Instrumentation.Decorators

  def start_link do
    GenServer.start_link(
      __MODULE__,
      LinkPreview.all_messages_with_ungenerated_link_previews(),
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
        message =
          message
          |> LinkPreview.generate_link_previews()
          |> MessageQueries.load_info()

        if message.has_links do
          group = GroupQueries.get_by_id(message.group_id)
          GroupChannel.broadcast_msg_link_previews_generated(group, message)
        end

        queue

      {{:value, %ConversationMessage{} = conversation_message}, queue} ->
        conversation_message =
          conversation_message
          |> LinkPreview.generate_link_previews()
          |> ConversationQueries.load_message_info()

        if conversation_message.has_links do
          conversation = Repo.get(Conversation, conversation_message.conversation_id)

          ConversationChannel.broadcast_msg_link_previews_generated(
            conversation,
            conversation_message
          )
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
