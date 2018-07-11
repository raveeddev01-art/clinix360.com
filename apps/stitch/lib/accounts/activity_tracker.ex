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
    Mobile.MessageNotificationQueue,
    Mobile.ConversationMessageNotificationQueue,
    Patient,
    AppUserId
  }

  require Logger

  @prefix "activity_tracker"

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
        "#{@prefix}:#{user.team_id}",
        to_string(active_until),
        to_string(user.id)
      ])

    case result do
      {:ok, _} ->
        :ok

      {:error, error} ->
        log_error(error)
        {:error, error}
    end
  end

  @spec remove_activity(User.t()) :: {:ok, [binary]} | {:error, any}
  def remove_activity(%User{} = user) do
    # Mark user as inactive first. That means they start getting PNs directly, bypassing the queue.
    # Only after that we start sending PNs that were queued during their activity period.
    with {:ok, _} <- Redix.command(["ZREM", "#{@prefix}:#{user.team_id}", to_string(user.id)]),
         {:ok, message_ids} <- remove_from_notification_queue(user) do
      {:ok, message_ids}
    else
      {:error, error} ->
        log_error(error)
        {:error, error}
    end
  end

  defp remove_from_notification_queue(%Patient{} = patient) do
    ConversationMessageNotificationQueue.remove_user_id(AppUserId.get(patient))
  end

  defp remove_from_notification_queue(%User{} = user) do
    MessageNotificationQueue.remove_user_id(user.id)
    ConversationMessageNotificationQueue.remove_user_id(AppUserId.get(user))
  end

  @spec clean_stale((binary, list -> any)) :: :ok | {:error, any}
  def clean_stale(fun) do
    current_timestamp = :erlang.system_time(:seconds)

    # For each team's sorted set, remove out-dated records using ZREMRANGEBYSCORE.
    # A record is outdated if its score is lower than the current timestamp.
    #
    # The out-dated records are the users that are being transitioned from "active" state to "inactive".
    # After marking them as "inactive", we want to send PNs to those users about unread messages
    # that have been accamulated in the PN queue while the users were "active".
    #
    # Note, this is done as an atomic operation (selecting and then removing) because
    # ZREMRANGEBYSCORE doesn't return removed records, which we need later for PNs.
    # Since we want to avoid data races, we wrap both commands in a transaction with MULTI/EXEC and
    # call ZRANGEBYSCORE before ZREMRANGEBYSCORE.
    #
    # "ZREMRANGEBYSCORE Removes all elements in the sorted set stored at key with
    # a score between min and max" — Redis doc.

    TeamQueries.team_ids()
    |> Task.async_stream(
      fn team_id ->
        commands = [
          ["MULTI"],
          [
            "ZRANGEBYSCORE",
            "#{@prefix}:#{team_id}",
            "-inf",
            to_string(current_timestamp - 1)
          ],
          [
            "ZREMRANGEBYSCORE",
            "#{@prefix}:#{team_id}",
            "-inf",
            to_string(current_timestamp - 1)
          ],
          ["EXEC"]
        ]

        case Redix.pipeline(commands) do
          {:ok, ["OK", _, _, [[], 0]]} ->
            :ok

          {:ok, ["OK", _, _, [user_ids, _]]} ->
            Enum.each(user_ids, fn user_id ->
              with {:ok, message_ids} <- MessageNotificationQueue.remove_user_id(user_id) do
                fun.(user_id, message_ids)
              else
                error -> error
              end
            end)

          {:ok, command_error} ->
            log_error(command_error)
            {:error, command_error}

          {:error, error} ->
            log_error(error)
            {:error, error}
        end
      end,
      max_concurrency: 10,
      timeout: 60_000
    )
    |> Stream.run()
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
        "#{@prefix}:#{team_id}",
        current_timestamap,
        "+inf"
      ])

    case result do
      {:ok, result} ->
        result

      {:error, error} ->
        log_error(error)
        []
    end
  end

  defp log_error(error) do
    Logger.error("[#{__MODULE__}] #{inspect(error)}")
  end
end
