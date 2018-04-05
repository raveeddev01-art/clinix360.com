defmodule Stitch.Accounts.ActivityTracker do
  @moduledoc """
  Provides API for Redis-based activity tracker.

  Each team has its own sorted set with `timestamp_of_last_activity + inactivity_timeout`
  used as a score.
  This allows us to query active users for a given team using ZRANGEBYSCORE.
  """

  alias Stitch.{
    Redix,
    Task,
    Accounts.User,
    TeamQueries,
  }

  require Logger

  # 2 minutes
  @activity_timeout 2 * 60

  @spec async_update_activity(User.t()) :: {:ok, pid}
  def async_update_activity(%User{} = user) do
    Task.start(fn ->
      update_activity(user)
    end)
  end

  @spec update_activity(User.t()) :: :ok | {:error, any}
  def update_activity(%User{} = user) do
    active_until = :erlang.system_time(:seconds) + @activity_timeout

    # Creates or update the user_id in the team's sorted set with the specified score
    # The score is the timestamp until the user is considered active.
    result =
      Redix.command([
        "ZADD",
        "activity_tracker:#{user.team_id}",
        to_string(active_until),
        to_string(user.id)
      ])

    case result do
      {:ok, _} ->
        :ok

      {:error, error} ->
        Logger.error("[#{__MODULE__}] #{inspect(error)}")
        {:error, error}
    end
  end

  @spec remove_activity(User.t()) :: :ok | {:error, any}
  def remove_activity(%User{} = user) do
    # Remove the user from the set.
    result =
      Redix.command([
        "ZREM",
        "activity_tracker:#{user.team_id}",
        to_string(user.id)
      ])

    case result do
      {:ok, _} ->
        :ok

      {:error, error} ->
        Logger.error("[#{__MODULE__}] #{inspect(error)}")
        {:error, error}
    end
  end

  @spec clean_stale() :: :ok | {:error, any}
  def clean_stale() do
    current_timestamp = :erlang.system_time(:seconds)

    # For each team's sorted set, remove out-dated records using ZREMRANGEBYSCORE.
    # A record is outdated if its score is lower than the current timestamp.
    #
    # "ZREMRANGEBYSCORE Removes all elements in the sorted set stored at key with
    # a score between min and max" — Redis doc.
    commands =
      TeamQueries.team_ids()
      |> Enum.map(fn team_id ->
        [
          "ZREMRANGEBYSCORE",
          "activity_tracker:#{team_id}",
          "-inf",
          to_string(current_timestamp - 1)
        ]
      end)

    case Redix.pipeline(commands) do
      {:ok, _} ->
        :ok

      {:error, error} ->
        Logger.error("[#{__MODULE__}] #{inspect(error)}")
        {:error, error}
    end
  end

  @doc """
  Returns currently active user ids.
  """
  @spec active_user_ids(pos_integer) :: list
  def active_user_ids(team_id) do
    current_timestamap = to_string(:erlang.system_time(:seconds))

    # Selects active users using the score as an index.
    # A user is active if their score in the set is higher than the current timestamp.
    #
    # "ZRANGEBYSCORE Returns all the elements in the sorted set at key with a score between
    # min and max" — Redis doc.
    result =
      Redix.command([
        "ZRANGEBYSCORE",
        "activity_tracker:#{team_id}",
        current_timestamap,
        "+inf",
      ])

    case result do
      {:ok, result} ->
        result

      {:error, error} ->
        Logger.error("[#{__MODULE__}] #{inspect(error)}")
        []
    end
  end
end
