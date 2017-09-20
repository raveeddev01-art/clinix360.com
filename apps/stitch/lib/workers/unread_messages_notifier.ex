defmodule Stitch.UnreadMessagesNotifier do
  use GenServer

  def start_link do
    GenServer.start_link(__MODULE__, %{})
  end


  def init(state) do
    schedule_work(:every_15_min)
    schedule_work(:hourly)
    schedule_work(:daily)
    {:ok, state}
  end

  def handle_info(:every_15_min, state) do
    send_email_notifications("15min")
    schedule_work(:every_15_min)
    {:noreply, state}
  end

  def handle_info(:hourly, state) do
    send_email_notifications("hourly")
    schedule_work(:hourly)
    {:noreply, state}
  end

  def handle_info(:daily, state) do
    send_email_notifications("daily")
    clean_delivered()
    schedule_work(:daily)
    {:noreply, state}
  end

  defp schedule_work(:every_15_min) do
    Process.send_after(self(), :every_15_min, seconds_until(:hour_quarter) * 1000)
  end

  defp schedule_work(:hourly) do
    Process.send_after(self(), :hourly, seconds_until(:hour) * 1000)
  end

  defp schedule_work(:daily) do
    Process.send_after(self(), :daily, seconds_until(:day) * 1000)
  end

  def seconds_until(interval, datetime \\ DateTime.utc_now)

  def seconds_until(:hour_quarter, %DateTime{minute: minute, second: second}) do
    remaining_minutes = (((div(minute, 15) + 1) * 15) - minute - 1)
    remaining_seconds = 60 - second
    (remaining_minutes * 60) + remaining_seconds
  end

  def seconds_until(:hour, %DateTime{minute: minute, second: second}) do
    ((60 - minute - 1) * 60) + (60 - second)
  end

  def seconds_until(:day, datetime) do
    Timex.Comparable.diff(Timex.end_of_day(datetime), datetime, :seconds) + 1 # make sure one second overflow so that next cycle we are on the next day
  end

  def clean_delivered do
    Task.start fn ->
      Stitch.EmailNotification.clean_delivered()
    end
  end

  def send_email_notifications(notification_preference) do
    users = Stitch.Accounts.User.with_email_notification_preference(notification_preference)
    users = Stitch.Repo.preload(users, [:team])
    users |> Enum.each(fn user ->
      message_ids = Stitch.EmailNotification.not_delivered(user.id)
      messages = Stitch.Message.find_by_ids(message_ids)
      email = Stitch.Accounts.Email.new_messages(user, user.team, messages)
      try do
        # TODO: async
        %Bamboo.Email{} = Stitch.Mailer.deliver_now(email)
        Stitch.EmailNotification.mark_as_delivered(user.id, message_ids)
      rescue _e ->
        # do not terminate the loop
        # log error
      end
    end)
  end
end
