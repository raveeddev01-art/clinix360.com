defmodule Stitch.Analytics.DailyReports do
  @moduledoc """
  An analytics daily report is a collection of user and team traits that have
  to be calculated and pushed to our analytics system on a daily basis.

  """

  alias Stitch.Analytics
  alias Stitch.Analytics.Event
  alias Stitch.Accounts.User
  alias Stitch.Team
  alias Stitch.MessageQueries
  alias Stitch.TeamQueries
  alias Stitch.UserQueries

  @doc """
  Creates a daily report for each team and user in the database.

  """
  @spec create :: any
  def create do
    teams = TeamQueries.list_teams()
    users = UserQueries.get_all()
    resources = teams ++ users

    Analytics.DailyReports.Supervisor
    |> Task.Supervisor.async_stream_nolink(resources, &(create(&1)), timeout: :timer.minutes(2))
    |> Enum.to_list()
  end

  @doc """
  Adds an identify or group request to the 'segment_events' table with daily
  report related traits.

  Users that haven't been on-boarded and teams with no admin/owner will be
  ignored.

  """
  @spec create(User.t | Team.t) :: {:ok, Event.t} | {:error, Ecto.Changeset.t | atom}
  def create(%User{onboarded: false}), do: {:error, :user_not_onboarded}
  def create(%User{id: user_id} = user) do
    traits = daily_report(user)
    Analytics.identify(user_id, traits)
  end
  def create(%Team{id: team_id} = team) do
    if owner = TeamQueries.get_team_owner(team) do
      traits = daily_report(team)
      Analytics.group(%{user_id: owner.id, team_id: team_id}, traits)
    else
      {:error, :nil_owner}
    end
  end

  defp daily_report(target) do
    %{
      "messages_sent_last_day"         => MessageQueries.count(target, %{time_period: :last_day}),
      "messages_sent_last_7_days"      => MessageQueries.count(target, %{time_period: :last_7_days}),
      "messages_sent_last_30_days"     => MessageQueries.count(target, %{time_period: :last_30_days}),
      "messages_sent_all_time"         => MessageQueries.count(target, %{time_period: :all_time}),
      "messages_sent_last_occurred_at" => MessageQueries.last_occurred_at(target)
    }
  end
end
