defmodule StitchConnect.MobileBadgeUpdater do
  @timeout 2000

  use GenServer

  def start_link() do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def init(_args) do
    {:ok, %{}}
  end

  def push_badge_update(user) do
    GenServer.cast(__MODULE__, {:update_badge, user})
  end

  def handle_cast({:update_badge, user}, state) do
    case Map.fetch(state, user.id) do
      :error ->
        timer = Process.send_after(self(), {:timer, user.id}, @timeout)
        state = Map.put(state, user.id, %{user: user, timer: timer})
        {:noreply, state}
      {:ok, %{user: user, timer: timer}} ->
        Process.cancel_timer(timer)
        timer = Process.send_after(self(), {:timer, user.id}, @timeout)
        state = put_in(state, [user.id, :timer], timer)
        {:noreply, state}
    end
  end

  def handle_info({:timer, user_id}, state) do
    case Map.fetch(state, user_id) do
      :error ->
        {:noreply, state}
      {:ok, %{user: user}} ->
        StitchConnect.Web.PushNotifications.do_push_badge_update_to_user(user)
        state = Map.delete(state, user_id)
        {:noreply, state}
    end
  end

  def handle_info(_a, state) do
    {:noreply, state}
  end
end
