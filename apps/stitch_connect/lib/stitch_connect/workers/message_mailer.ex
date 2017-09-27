defmodule StitchConnect.MessageMailer do
  use Quantum.Scheduler, otp_app: :stitch

  def deliver(notification_preference) do
    Stitch.Accounts.User.with_email_notification_preference(notification_preference)
    |> Stitch.Repo.preload([:team])
    |> Task.async_stream(fn user ->
      try do
        message_count = Stitch.EmailNotification.count(user.id)
        if message_count > 0 do
          Stitch.Accounts.Email.unread_messages_email(user, message_count, login_url(user.team))
          Stitch.EmailNotification.clean_delivered(user.id)
        end
      rescue e ->
        IO.puts "Error while delivering emails about unread messages for user id #{user.id} (#{inspect(e)})"
      end
    end, max_concurrency: 50, timeout: 10 * 60 * 1000)
    |> Enum.to_list
  end

  defp subdomain_url(subdomain) do
    struct_url = StitchConnect.Web.Endpoint.struct_url
    %{ struct_url | host: "#{subdomain}.#{struct_url.host}" }
  end

  defp login_url(team) do
    struct_url = subdomain_url(team.slug)
    StitchConnect.Web.SubdomainRouter.Helpers.group_url(struct_url, :index, "general")
  end
end
