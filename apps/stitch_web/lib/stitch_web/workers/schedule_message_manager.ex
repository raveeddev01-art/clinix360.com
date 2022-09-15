defmodule Stitch.ScheduleMessageManager do
  @moduledoc """
  Generates Schedule messages.

  Worker is started w/ application.
  """
  use GenServer
  use Appsignal.Instrumentation.Decorators

  alias StitchConnect.Web.MessageEventsService
  alias Stitch.Web.ErrorHelpers
  alias Stitch.{
    GroupAuthorization,
    GroupQueries,
    Group,
    Message,
    MessageQueries
  }
  @wait_time 60 #Seconds

  def start_link do
    GenServer.start_link(
      __MODULE__,
      [],
      name: __MODULE__
    )
  end

  def queue(message) do
    GenServer.cast(__MODULE__, {:queue, message})
  end

  def init(messages) do
    queue = :queue.from_list(messages)
    schedule_queue_processing()
    {:ok, queue}
  end

  def handle_cast({:queue, message}, queue) do
    {:noreply, :queue.in(message, queue)}
  end

  def handle_info(:process_queue, queue) do
    queue = process_queue(queue)
    schedule_queue_processing()
    {:noreply, queue}
  end

  @decorate transaction(:background_job)
  def process_queue(queue) do
    case :queue.out(queue) do
      {{:value, data}, queue} ->
        time = convert_to_seconds(data)
        if time > 0 do
          :queue.in(data, queue)
        else
          %{"group_id" => group_id, "schedule_at" => _scheduled_at, "message_payload" => message_params_with_client, "user" => current_user, "presence" => presence} = data
          #Message Creation Code
          with {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
          {:authorized?, true} <-
            {:authorized?, GroupAuthorization.can_message?(group, current_user.id)},
          {:ok, %{message: message, notify_user_ids: notify_user_ids}} <-
            Message.create(group, current_user, message_params_with_client, presence) do
              message = %{message | user: current_user}
              # create_optional_upload_comment(message, group, current_user, presence, message_params)
              message = MessageQueries.load_message(message.id, current_user)
              MessageEventsService.message_creation_events(message, group, notify_user_ids)
          else
            {:group, _} ->
              {:error, :not_found, "The room you are looking for does not exist."}

            {:authorized?, false} ->
              {:error, :not_authorized, "You can't see the messages for this room."}

            {:error, :message, changeset, _changeset_so_far} ->
              {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}
          end
        end

        queue
      {:empty, queue} ->
        queue
    end
  end

  defp changeset_errors_to_string(changeset) do
    Enum.map(changeset.errors, fn {field, detail} ->
      "#{Phoenix.Naming.humanize(field)} #{ErrorHelpers.translate_error(detail)}"
    end)
    |> Enum.join(". ")
  end

  defp convert_to_seconds(%{"group_id" => _group_id, "schedule_at" => scheduled_at, "message_payload" => _message_params_with_client, "user" => _current_user, "presence" => _presence} = _data) do
    datetime_now = NaiveDateTime.utc_now()
    scheduled = NaiveDateTime.from_iso8601!(scheduled_at)
    time = NaiveDateTime.diff(scheduled, datetime_now, :millisecond)
    time
  end

  defp schedule_queue_processing do
    Process.send_after(self(), :process_queue, @wait_time * 1000) #1 Minute Delay Before Recheck
  end
end
