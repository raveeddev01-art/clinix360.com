defmodule StitchConnect.MessageLinkPreviewGenerator do
  use GenServer
  alias Stitch.Message.LinkPreview

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
        {{:value, _message}, queue} ->
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
