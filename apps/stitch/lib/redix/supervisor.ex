defmodule Stitch.Redix.Supervisor do
  use Supervisor
  @redix_config Application.get_env(:stitch, :redix)

  def start_link() do
    Supervisor.start_link(__MODULE__, nil)
  end

  def init(_) do
    pool_size = @redix_config.pool_size
    redis_url = if @redix_config.url, do: @redix_config.url, else: []

    redix_workers =
      for i <- 0..(pool_size - 1) do
        args = [redis_url, [name: :"redix_#{i}"]]
        worker(Redix, args, id: {Redix, i})
      end

    supervise(redix_workers, strategy: :one_for_one)
  end
end
