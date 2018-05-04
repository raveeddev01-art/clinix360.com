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

    Enum.map(users, fn user ->
      case Stitch.EmailNotification.for_user(user.id) do
        [] ->
          nil

        messages ->
          StitchConnect.Web.Email.NewMessagesView.new_messages_email(user, messages, team)
      end
    end)

    # TODO: uncomment
    # Stitch.EmailNotification.clean_delivered(user_ids)
  end
end
