defmodule StitchConnect.MessageLinkPreview.Supervisor do
  @moduledoc """
  The `MessageLinkPreview` supervisor.

  Provides sharded generator queues with overload protection.

  ## Messages with ungenerated link previews

  On startup, a dedicated generator is started to generate
  previews for all "pending" messages in the database that
  require preview generation. Dynamic calls for queued
  generation are sharded to workers automatically.


  ## Shard and buffer sizes

  The number of schedulers online (CPU cores) determines the shard size.
  Per shard, the `@max_buffer_size` attribute sets the maximum allowed
  queues messages for generation per shard, making the total allowed queued
  messages:

      @max_buffer_size * :erlang.system_info(:schedulers_online)

  """
  import Supervisor.Spec

  alias StitchConnect.MessageLinkPreview.Generator

  @name __MODULE__

  @max_buffer_size 50

  @doc """
  Starts the `MessageLinkPreview` supervision tree.

  The following options are supported:

  * `:max_buffer_size` - The maximum queue size per shard before messages
    are dropped. Default #{@max_buffer_size}.
  * `:name` - The registered name of the supervisor. Defaults `#{__MODULE__}`
  * `:generate_pending` - The Boolean flag to generate pending message
    link previews on startup. Defaults `true`
  """
  def start_link(opts \\ []) do
    opts = Keyword.merge([
      max_buffer_size: @max_buffer_size,
      name: @name,
      generate_pending?: true
    ], opts)

    task_sup = Module.concat(opts[:name], "TaskSupervisor")

    Supervisor.start_link([
      supervisor(Task.Supervisor, [[name: task_sup]]),
    ] ++ pending_children(task_sup, opts) ++ generator_children(task_sup, opts),
    strategy: :one_for_one, name: opts[:name])
  end

  @doc false
  def name, do: @name

  @doc false
  def pool_size, do: :erlang.system_info(:schedulers_online)

  @doc false
  def max_buffer_size, do: @max_buffer_size

  @doc false
  def shard(name, message_id) do
    message_id
    |> :erlang.phash2(pool_size())
    |> shard_name(name)
  end

  def generator_children(task_sup, opts) do
    for i <- 0..(pool_size() - 1) do
      shard_name = shard_name(i, opts[:name])
      worker(Generator, [fn -> [] end, shard_name, task_sup, opts], id: shard_name)
    end
  end

  defp pending_children(task_sup, opts) do
    if Keyword.fetch!(opts, :generate_pending?) do
      pending_func = &Stitch.Message.LinkPreview.messages_with_ungenerated_link_previews/0
      shard = shard_name(:pending, opts[:name])
      [worker(Generator, [pending_func, shard, task_sup, opts], id: :pending, restart: :transient)]
    else
      []
    end
  end

  defp shard_name(count, name), do: Module.concat([name, "Shard#{count}"])
end
