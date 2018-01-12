defmodule StitchConnect.MessageLinkPreviewGenerator do
  use GenServer
  alias Stitch.Message.LinkPreview
  alias Stitch.{GroupQueries, MessageQueries}
  alias StitchConnect.Web.GroupChannel

  def start_link do
    GenServer.start_link(
      __MODULE__,
      LinkPreview.messages_with_ungenerated_link_previews,
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
    queue =
      case :queue.out(queue) do
        {{:value, message}, queue} ->
          message =
            message
            |> LinkPreview.generate_link_previews
            |> MessageQueries.load_info

          group = GroupQueries.get_by_id(message.group_id)
          GroupChannel.broadcast_msg_link_previews_generated(group, message)
          queue

        {:empty, queue} ->
          queue
      end

    schedule_queue_processing()
    {:noreply, queue}
  end

  defp schedule_queue_processing do
    Process.send_after(self(), :process_queue, 500)
  end
end
