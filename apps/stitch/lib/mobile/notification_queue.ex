defmodule Stitch.Mobile.NotificationQueue do
  alias Stitch.{
    Redix,
    Task
  }

  require Logger

  @prefix "notification_queue"

  @spec async_enqueue_for_users([pos_integer], [binary]) :: {:ok, pid}
  def async_enqueue_for_users(user_ids, message_id) do
    Task.start fn ->
      enqueue_for_users(user_ids, message_id)
    end
  end

  def enqueue_for_users([], _message_id), do: :ok
  def enqueue_for_users(user_ids, message_id) do
    commands =
      Enum.map(user_ids, fn user_id ->
        [
          "SADD",
          "#{@prefix}:#{user_id}",
          to_string(message_id),
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

  @spec enqueue(pos_integer, pos_integer) :: :ok | {:error, any }
  def enqueue(user_id, message_id) do
    result =
      Redix.command([
        "SADD",
        "#{@prefix}:#{user_id}",
        to_string(message_id),
      ])

    case result do
      {:ok, _} ->
        :ok
      {:error, error} ->
        Logger.error("[#{__MODULE__}] #{inspect(error)}")
        {:error, error}
    end
  end

  @doc """
  Removes the messages from the PN queue.
  Expected to be called on the mark-as-read event.

  The user has just read these messages and so we won't be sending PNs with them.
  """
  @spec remove_message_ids(pos_integer, [pos_integer]) :: :ok | {:error, any}
  def remove_message_ids(_user_id, []), do: :ok
  def remove_message_ids(user_id, message_ids) do
    result =
      Redix.command([
        "SREM",
        "#{@prefix}:#{user_id}"
      ] ++ message_ids)

    case result do
      {:ok, _} ->
        :ok
      {:error, error} ->
        Logger.error("[#{__MODULE__}] #{inspect(error)}")
        {:error, error}
    end
  end

  @doc """
  Remove all the queued PNs and returns corresponding message_ids.
  Expected to be called when the user makes a transition from "active" state to "inactive".

  The user has just became inactive and we want to notify them about all the messsages
  they haven't read while they were active.
  """
  @spec remove_user_id(pos_integer) :: {:ok, [pos_integer]} | {:error, any}
  def remove_user_id(user_id) do
    result =
      Redix.pipeline([
        ["SMEMBERS", "#{@prefix}:#{user_id}"],
        ["DEL", "#{@prefix}:#{user_id}"],
      ])

    case result do
      {:ok, [message_ids, _]} ->
        {:ok, message_ids}
      {:error, error} ->
        Logger.error("[#{__MODULE__}] #{inspect(error)}")
        {:error, error}
    end
  end
end
