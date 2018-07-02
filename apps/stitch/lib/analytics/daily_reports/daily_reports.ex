defmodule Stitch.Analytics.DailyReports do
  @moduledoc """
  An analytics daily report is a collection of user and team traits that have
  to be calculated and pushed to our analytics system on a daily basis.

  """

  use Appsignal.Instrumentation.Decorators
  import Ecto.Query
  alias Stitch.{Analytics, ChunkStream, MessageQueries, Team, TeamQueries}
  alias Stitch.Accounts.User
  alias Stitch.Analytics.Event

  @doc """
  Creates a daily report for each team and user in the database.
  """
  @spec create :: any
  @decorate transaction(:background_job)
  def create do
    Enum.each(
      [user_query(), team_query()],
      &create_for_query/1
    )
  end

  defp create_for_query(query) do
    query
    |> ChunkStream.chunk(50)
    |> Stream.each(&start_resources_stream/1)
    |> Stream.run()
  end

  defp start_resources_stream(resources) do
    Analytics.DailyReports.Supervisor
    |> Task.Supervisor.async_stream_nolink(
      resources_to_struct(resources),
      &create(&1),
      timeout: :timer.minutes(3),
      max_concurrency: 2
    )
    |> Enum.to_list()
  end

  defp user_query do
    User
    |> select([u], %{
      id: u.id,
      inserted_at: u.inserted_at,
      onboarded: u.onboarded,
      is_user: true
    })
  end

  defp team_query do
    Team
    |> select([t], %{
      id: t.id,
      inserted_at: t.inserted_at,
      is_team: true
    })
  end

  # The queries return lists of plain maps, we want
  # to match on %Team{} & %User{} in MessageQueries &
  # TeamQueries, so convert them here
  defp resources_to_struct(resources) do
    Enum.map(resources, &resource_to_struct/1)
  end

  defp resource_to_struct(resource) do
    if resource[:is_user] do
      struct(User, resource)
    else
      struct(Team, resource)
    end
  end

  @doc """
  Adds an identify or group request to the 'segment_events' table with daily
  report related traits.

  Users that haven't been on-boarded and teams with no admin/owner will be
  ignored.

  """
  @spec create(User.t() | Team.t()) :: {:ok, Event.t()} | {:error, Ecto.Changeset.t() | atom}
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
      "messages_sent_last_day" => MessageQueries.count(target, %{time_period: :last_day}),
      "messages_sent_last_7_days" => MessageQueries.count(target, %{time_period: :last_7_days}),
      "messages_sent_last_30_days" => MessageQueries.count(target, %{time_period: :last_30_days}),
      "messages_sent_all_time" => MessageQueries.count(target, %{time_period: :all_time}),
      "messages_sent_last_occurred_at" => MessageQueries.last_occurred_at(target)
    }
  end
end
