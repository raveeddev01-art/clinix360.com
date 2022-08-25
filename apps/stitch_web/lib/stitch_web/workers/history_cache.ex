defmodule Stitch.HistoryCache do
  use GenServer
  @tab :history_cache

  # Client

  def start_link do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  # @spec fetch(binary | nil) :: any | any
  # def fetch(nil), do: nil

  # def fetch(user_id, new_history) do
  #   case get(user_id) do
  #     {:not_found} ->
  #       {:ok, result} = set(user_id, new_history)
  #       result
  #     result ->
  #       :ets.insert(@tab, {user_id, result ++ new_history})
  #   end
  # end

  # @spec get(binary) :: {:not_found} | any
  def get(user_id) do
    case :ets.lookup(@tab, user_id) do
      [{_k, result}] -> result
      _ -> {:not_found}
    end
  end

  # @spec set(binary, list) :: map
  def set(user_id, new_history) do
    case get(user_id) do
      {:not_found} ->
        :ets.insert(@tab, {user_id, new_history})
      result ->
        :ets.insert(@tab, {user_id, result ++ new_history})
    end
    {:ok, %{added: "history saved"}}
  end

  def delete(user_id) do
    :ets.delete(:user_lookup, user_id)
  end

  # Server

  def init(_) do
    :ets.new(@tab, [:set, :named_table, :public, read_concurrency: true, write_concurrency: true])
    {:ok, %{}}
  end

  # defp time_now, do: :erlang.system_time(:seconds)

  # defp expires_at do
  #   :erlang.system_time(:seconds)
  #   |> Kernel.+(Stitch.AWS.S3.expires_in())
  # end
end
