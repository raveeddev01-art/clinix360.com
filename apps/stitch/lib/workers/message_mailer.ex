defmodule Stitch.MessageMailer do
  use Quantum.Scheduler, otp_app: :stitch

  def deliver(notification_preference) do
    Stitch.Accounts.User.with_email_notification_preference(notification_preference)
    |> Stitch.Repo.preload([:team])
    |> Task.async_stream(fn user ->
      try do
        message_count = Stitch.EmailNotification.count(user.id)
        if message_count > 0 do
          email = Stitch.Accounts.Email.unread_messages(user, user.team, message_count)
          %Bamboo.Email{} = Stitch.Mailer.deliver_now(email)
          Stitch.EmailNotification.clean_delivered(user.id)
        end
      rescue e ->
        IO.puts "Error while delivering emails about unread messages for user id #{user.id} (#{inspect(e)})"
      end
    end, max_concurrency: 50, timeout: :infinity)
    |> Enum.to_list
  end
end
