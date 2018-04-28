defmodule StitchConnect.MessageMailer do
  use Quantum.Scheduler, otp_app: :stitch_connect
  use Appsignal.Instrumentation.Decorators
  import Ecto.Query
  alias Stitch.{Team, UserQueries}

  @decorate transaction(:background_job)
  def deliver(notification_preference) do
    Team
    |> select([:id, :name, :slug])
    |> Stitch.ChunkStream.chunk(25)
    |> Stream.each(&deliver_for_teams(&1, notification_preference))
    |> Stream.run()
  end

  def deliver_for_teams(teams, notification_preference) do
    Enum.each(teams, &deliver_for_team(&1, notification_preference))
  end

  def deliver_for_team(team, notification_preference) do
    UserQueries.with_email_notification_preference(notification_preference)
    |> UserQueries.for_team_query(team.id)
    |> Stitch.ChunkStream.chunk(50)
    |> Stream.each(&deliver_for_users(&1, team))
    |> Stream.run()
  end

  def deliver_for_users(users, team) do
    user_ids = Enum.map(users, & &1.id)
    with_new_emails =
      Stitch.EmailNotification.count(user_ids)
      |> Enum.reduce(%{}, & Map.put(&2, &1.user_id, &1.message_count))
    recipients = prepare_recipients(users, team, with_new_emails)
    Stitch.Accounts.Email.unread_messages_email(recipients, team)
    Stitch.EmailNotification.clean_delivered(user_ids)
  end

  def prepare_recipients(users, team, with_new_emails) do
    users
    |> Enum.reduce([], fn user, acc ->
      case Stitch.Mobile.badge_value(user, true) do
        0 -> acc
        message_count ->
          if with_new_emails[user.id],
            do: [recipient(user, message_count, team) | acc],
            else: acc
      end
    end)
  end

  defp recipient(user, message_count, team) do
    %{
      first_name: user.first_name || "There",
      email: user.email,
      timezone: user.timezone[:tz] || "Etc/UTC",
      id: user.id,
      message_count: message_count,
      login_url: login_url(team)
    }
  end

  defp subdomain_url(subdomain) do
    struct_url = StitchConnect.Web.Endpoint.struct_url()
    %{struct_url | host: "#{subdomain}.#{struct_url.host}"}
  end

  defp login_url(%Team{slug: slug}) do
    struct_url = subdomain_url(slug)
    StitchConnect.Web.SubdomainRouter.Helpers.group_url(struct_url, :index, "general")
  end
end
