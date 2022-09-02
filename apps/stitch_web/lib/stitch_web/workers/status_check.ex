defmodule Stitch.StatusChecker do
  use GenServer

  alias Stitch.Repo
  alias Stitch.Accounts.User
  # Client

  def start_link do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  # @spec fetch(binary | nil) :: binary | nil
  def fetch(nil), do: nil

  def fetch(user_id) do
    case get(user_id) do
      {:not_found} ->
        :error

      time ->
        if time_now() > time do
          IO.inspect(:ok, label: "Reset time")
          set(user_id)
        else
          IO.inspect(:ok, label: "Time calculating")
        end
    end
  end

  # @spec get(binary) :: {:not_found} | {:found, {pos_integer, binary}}
  def get(user_id) do
    case Repo.get(User, user_id) do
      user -> user.status_time
      _ -> :not_found
    end
  end

  # @spec set(binary) :: {pos_integer, binary}
  def set(user_id) do
    Account.update_status(user_id, "", "", "")
  end

  # Server

  def init(_) do
    schedule_queue_processing()
    {:ok, %{}}
  end

  defp time_now, do: :erlang.system_time(:seconds)

  defp schedule_queue_processing do
    Process.send_after(self(), :fetch, 500)
  end
end
