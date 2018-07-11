defmodule Stitch.Mobile.NotificationQueue do
  @moduledoc """
  A notification queue for Engage and Connect.
  Each application defines its unique prefix to avoid conflicts within the same Redis instance.

  The workflow for each application is the following:

  - on message creation, call `async_enqueue_for_users/2`
  - on the mark_as_read event, call `remove_message_ids/2`
  - when the user's state changes from "active" to "inactive" or when the user disconnects,
    call `remove_user_id/1` to get the queued messages to send the PNs.

  ## Example

      defmodule Stitch.Mobile.MessageNotificationQueue do
        use Stitch.Mobile.NotificationQueue, stitch_app_prefix: "message"
      end
  """

  @doc """
  Asynchronously add message to the notification queue.
  This should be called on the message creation event.
  """
  @callback async_enqueue_for_users(user_ids :: [integer], message_id :: integer) :: term

  @doc """
  Removes the messages from the PN queue.
  Expected to be called on the mark-as-read event.

  The user has just read these messages, and so we won't be sending PNs with them.
  """
  @callback remove_message_ids(user_id :: integer | String.t(), message_ids :: [integer]) ::
              :ok | {:error, any}

  @doc """
  Remove all the queued PNs and returns corresponding message_ids.
  Expected to be called when the user makes a transition from "active" state to "inactive".

  The user has just became inactive and we want to notify them about all the messsages
  they haven't read while they were active.
  """
  @callback remove_user_id(user_id :: integer | String.t()) :: {:ok, [integer]} | {:error, any}

  defmacro __using__(options) do
    stitch_app_prefix = options[:stitch_app_prefix] || []

    quote bind_quoted: [stitch_app_prefix: stitch_app_prefix] do
      @behaviour Stitch.Mobile.NotificationQueue

      alias Stitch.{
        Redix,
        Task
      }

      require Logger

      @prefix stitch_app_prefix

      def async_enqueue_for_users(user_ids, message_id) do
        Task.start(fn ->
          enqueue_for_users(user_ids, message_id)
        end)
      end

      defp enqueue_for_users([], _message_id), do: :ok

      defp enqueue_for_users(user_ids, message_id) do
        commands =
          Enum.map(user_ids, fn user_id ->
            [
              "SADD",
              "#{@prefix}:#{user_id}",
              to_string(message_id)
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

      def remove_message_ids(_user_id, []), do: :ok

      def remove_message_ids(user_id, message_ids) do
        result =
          Redix.command(
            [
              "SREM",
              "#{@prefix}:#{user_id}"
            ] ++ message_ids
          )

        case result do
          {:ok, _} ->
            :ok

          {:error, error} ->
            Logger.error("[#{__MODULE__}] #{inspect(error)}")
            {:error, error}
        end
      end

      def remove_user_id(user_id) do
        result =
          Redix.pipeline([
            ["SMEMBERS", "#{@prefix}:#{user_id}"],
            ["DEL", "#{@prefix}:#{user_id}"]
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
  end
end
