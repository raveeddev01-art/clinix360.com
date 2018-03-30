defmodule StitchConnect.PresignedUrlCache do
  use GenServer
  @tab :presigned_url_cache

  # Client

  def start_link do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  @spec fetch(binary | nil) :: binary
  def fetch(nil), do: nil
  def fetch(object_name) do
    case get(object_name) do
      {:not_found} ->
        {_expires_at, value} = set(object_name)
        value
      {:found, {expires_at, result}} ->
        if time_now() > expires_at do
          {_expires_at, value} = set(object_name)
          value
        else
          result
        end
    end
  end

  @spec get(binary) :: {:not_found} | {:found, {pos_integer, binary}}
  def get(object_name) do
    case :ets.lookup(@tab, object_name) do
      [] -> {:not_found}
      [{_k, result}] -> {:found, result}
    end
  end

  @spec set(binary) :: {pos_integer, binary}
  def set(object_name) do
    {:ok, presigned_url} = Stitch.AWS.S3.presign(object_name)
    value = {expires_at(), presigned_url}
    true = :ets.insert(@tab, {object_name, value})
    value
  end

  # Server

  def init(_) do
    :ets.new(@tab, [:set, :named_table, :public, read_concurrency: true,
                                                 write_concurrency: true])

    {:ok, %{}}
  end

  defp time_now, do: :erlang.system_time(:seconds)

  defp expires_at do
    :erlang.system_time(:seconds)
    |> Kernel.+(Stitch.AWS.S3.expires_in())
  end
end
