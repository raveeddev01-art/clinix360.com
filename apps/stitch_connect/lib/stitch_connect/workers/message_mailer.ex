defmodule StitchConnect.MessageMailer do
  use Quantum.Scheduler, otp_app: :stitch_connect

  def deliver(notification_preference) do
    Stitch.Accounts.User.with_email_notification_preference(notification_preference)
    |> Stitch.ChunkStream.chunk(100)
    |> Stream.each(&deliver_for_users/1)
    |> Stream.run
  end

  def deliver_for_users(users) do
    users = users |> Stitch.Repo.preload(:team)
    users_map = Enum.reduce(users, %{}, & Map.put(&2, &1.id, &1))
    recipients = prepare_recipients(users, users_map)
    Stitch.Accounts.Email.unread_messages_email(recipients)
    Stitch.EmailNotification.clean_delivered(Enum.map(recipients, & &1.id))
  end

  def prepare_recipients(users, users_map) do
    users
    |> Enum.map(& &1.id)
    |> Stitch.EmailNotification.count
    |> Enum.map(& recipient(users_map[&1.user_id], &1.message_count))
  end

  defp recipient(user, message_count) do
    %{first_name: user.first_name,
      email: user.email,
      id: user.id,
      message_count: message_count,
      login_url: login_url(user.team) }
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
