defmodule Stitch.MessageMailer do
  use Quantum.Scheduler, otp_app: :stitch

  def deliver(notification_preference) do
    Stitch.Accounts.User.with_email_notification_preference(notification_preference)
    |> Stitch.Repo.preload([:team])
    |> Task.async_stream(fn user ->
      try do
        message_ids = Stitch.EmailNotification.not_delivered(user.id)
        messages = Stitch.Message.find_by_ids(message_ids)
        email = Stitch.Accounts.Email.unread_messages(user, user.team, messages)
        %Bamboo.Email{} = Stitch.Mailer.deliver_now(email)
        Stitch.EmailNotification.mark_as_delivered(user.id, message_ids)
      rescue e ->
        IO.puts "Error while delivering emails about unread messages #{inspect(e)}"
      end
    end, max_concurrency: 10, timeout: :infinity)
    |> Enum.to_list
  end
end
