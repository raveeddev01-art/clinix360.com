defmodule StitchConnect.MessageMailer do
  use Quantum.Scheduler, otp_app: :stitch_web
  use Appsignal.Instrumentation.Decorators
  import Ecto.Query
  alias Stitch.{Team, UserQueries}

  @decorate transaction(:background_job)
  def deliver(notification_preference) do
    IO.inspect(notification_preference, label: "here is notification_preference checkpoint1")
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
    IO.inspect(notification_preference , label: "here is sending emails notification_preference checkpoint2")
    IO.inspect(team , label: "here is sending emails to the team checkpoint2")
    UserQueries.with_email_notification_preference(notification_preference)
    |> IO.inspect(label: "1")
    |> UserQueries.for_team_query(team.id)
    |> IO.inspect(label: "2")
    |> Stitch.ChunkStream.chunk(50)
    |> IO.inspect(label: "3")
    |> Stream.each(&deliver_for_users(&1, team))
    |> IO.inspect(label: "4")
    |> Stream.run()
    # |> Enum.each(fn x -> :ok end)
    |> IO.inspect(label: "running stream")
  end

  def deliver_for_users(users, team) do
    IO.inspect(users, label: "here is sending emails to the users checkpoint3")
    IO.inspect(team, label: "here is sending emails to the team checkpoint3")
    user_ids = Enum.map(users, & &1.id)
    IO.inspect(user_ids, label: "here is user_ids")

    with_new_emails =
      Stitch.EmailNotification.count(user_ids)
      |> IO.inspect(label: "after emailnotification count")
      |> Enum.reduce(%{}, &Map.put(&2, &1.user_id, &1.message_count))
    IO.inspect(with_new_emails, label: "here is with_new_emails")

    recipients = prepare_recipients(users, team, with_new_emails)
    IO.inspect(recipients, label: "here is recipients")
    Stitch.Accounts.Email.unread_messages_email(recipients, team)
    |> IO.inspect(label: "here is sending emails lastly")
    Stitch.EmailNotification.clean_delivered(user_ids)
  end

  def prepare_recipients(users, team, with_new_emails) do
    users
    |> Enum.reduce([], fn user, acc ->
      case Stitch.Mobile.badge_value(user, true) do
        0 ->
          acc

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
      timezone: user.timezone[:tz],
      id: user.id,
      message_count: message_count,
      login_url: login_url(team)
    }
  end

  defp subdomain_url(subdomain) do
    struct_url = Stitch.Web.Endpoint.struct_url()
    %{struct_url | host: "#{subdomain}.#{struct_url.host}"}
  end

  defp login_url(%Team{slug: slug}) do
    struct_url = subdomain_url(slug)
    Stitch.Web.SubdomainRouter.Helpers.group_url(struct_url, :index, "general")
  end
end
