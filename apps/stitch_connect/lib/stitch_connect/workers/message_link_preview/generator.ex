defmodule StitchConnect.MessageLinkPreview.Generator do
  @moduledoc false
  use GenServer
  require Logger

  alias Stitch.Message.LinkPreview
  alias Stitch.{GroupQueries, MessageQueries}
  alias StitchConnect.Web.GroupChannel
  alias StitchConnect.MessageLinkPreview.TaskSupervisor

  def start_link(messages_func, name, opts) do
    GenServer.start_link(__MODULE__, [messages_func, name, opts], name: name)
  end

  def queue(message) do
    name = StitchConnect.MessageLinkPreview.Supervisor.name()
    queue(name, message)
  end

  def queue(name, message) do
    name
    |> StitchConnect.MessageLinkPreview.Supervisor.shard(message.id)
    |> GenServer.call({:queue, message})
  end

  def init([messages_func, name, opts]) when is_function(messages_func) do
    pending_messages = messages_func.()

    state = schedule(%{
      queue: :queue.from_list(pending_messages),
      ref: nil,
      max_buffer_size: Keyword.fetch!(opts, :max_buffer_size),
      name: name,
      subscriber: opts[:subscriber]
    })

    {:ok, state}
  end

  def handle_call({:queue, message}, _from, %{queue: queue} = state) do
    if within_load_limits?(state) do
      {:reply, :ok, schedule(%{state | queue: :queue.in(message, queue)})}
    else
      Logger.error(fn -> "exceeded buffer limit (#{state.max_buffer_size}) for #{inspect __MODULE__}" end)
      {:reply, {:error, :buffer_limit_reached, :queue.len(state.queue)}, state}
    end
  end

  def handle_info({:DOWN, ref, :process, _pid, _reason}, %{ref: ref} = state) do
    {:noreply, schedule(%{state | ref: nil})}
  end

  def handle_info(:process_queue, %{ref: ref} = state) when is_reference(ref) do
    {:noreply, state}
  end

  def handle_info(:process_queue, %{queue: queue} = state) do
    case :queue.out(queue) do
      {{:value, message}, queue} ->
        {:ok, pid} = async_generate_previews(message, state)
        ref = Process.monitor(pid)
        {:noreply, %{state | ref: ref, queue: queue}}

      {:empty, queue} -> {:noreply, %{state | queue: queue}}
    end
  end

  defp async_generate_previews(message, state) do
    Task.Supervisor.start_child(TaskSupervisor, fn ->
      message =
        message
        |> LinkPreview.generate_link_previews()
        |> MessageQueries.load_info()

      group = GroupQueries.get_by_id(message.group_id)
      GroupChannel.broadcast_msg_link_previews_generated(group, message)
      notify_subscriber(state, {:preview_generated, message.id})

      :ok
    end)
  end

  defp notify_subscriber(%{subscriber: nil}, _msg), do: :noop
  defp notify_subscriber(%{subscriber: pid}, msg), do: send(pid, msg)

  defp schedule(state) do
    if is_nil(state.ref) and :queue.len(state.queue) > 0 do
      send(self(), :process_queue)
      state
    else
      state
    end
  end

  defp within_load_limits?(state) do
    :queue.len(state.queue) < state.max_buffer_size
  end
end
