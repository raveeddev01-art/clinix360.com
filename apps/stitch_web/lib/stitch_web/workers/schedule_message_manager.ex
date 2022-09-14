defmodule Stitch.ScheduleMessageManager do
  @moduledoc """
  Generates Schedule messages.

  Worker is started w/ application.
  """
  use GenServer
  use Appsignal.Instrumentation.Decorators

  alias StitchConnect.Web.{
    GroupChannel,
    PushNotifications,
    UserStatusService,
    Api.V1.MessageView,
    MessageEventsService
  }

  alias Stitch.Web.{
    StarringEventsService,
    UrlService,
    FileService
  }

  alias Stitch.{
    GroupAuthorization,
    GroupQueries,
    Group,
    Files,
    StarrableItems.StarringService,
    Message,
    Message.MessageCreation,
    MessageAuthorization,
    MessageAction,
    MessageNotification,
    MessageQueries,
    Files.FileQueries,
    Files.Upload,
    ReadStatus,
    Web.EventsChannel,
    Web.FileService
  }

  alias Stitch.Web.ErrorHelpers

  def start_link do
    GenServer.start_link(
      __MODULE__,
      [],
      name: __MODULE__
    )
  end

  def queue(message) do
    IO.inspect(message, label: "Sent Message---->>")
    GenServer.cast(__MODULE__, {:queue, message})
  end

  def init(messages) do
    queue = :queue.from_list(messages)
    IO.inspect(queue, label: "Queue---->")
    if :queue.is_empty(queue) do
      IO.inspect("Empty Queue")
      schedule_queue_processing()
      {:ok, queue}
    else
      IO.inspect("Hello there.....___>>>")
      schedule_queue_processing()
      {:ok, queue}
    end
  end

  def handle_cast({:queue, message}, queue) do
    {:noreply, :queue.in(message, queue)}
  end

  def handle_info(:process_queue, queue) do
    IO.inspect(queue, label: "Current Queue")
    queue = process_queue(queue)

    schedule_queue_processing()
    {:noreply, queue}
  end

  @decorate transaction(:background_job)
  def process_queue(queue) do
    case :queue.out(queue) do
      {{:value, data}, queue} ->
        IO.inspect("So waht now?")
        time = convert_to_seconds(data)
        if time > 0 do
          Process.sleep(time)
        else
          Process.sleep(500)
        end
        IO.inspect(:ok, label: "After Time Delay")
        message_params = Map.get(data, "message_params")
        group_id = Map.get(message_params,"group_id") |> IO.inspect(label: "Group_ID---->>>>")
        current_user = Map.get(data, "user") |> IO.inspect(label: "User---->>>>")
        presence = Map.get(data, "presence") |> IO.inspect(label: "Presence---->>>>")
        with {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id) |> IO.inspect(label: "Get Group")},
         {:authorized?, true} <-
           {:authorized?, GroupAuthorization.can_message?(group, current_user.id) |> IO.inspect(label: "Get Auth")},
         {:ok, %{message: message, notify_user_ids: notify_user_ids}} <-
           Message.create(group, current_user, message_params, presence) |> IO.inspect(label: "Message Create") do
            IO.inspect("After Message Creation")
            message = %{message | user: current_user}
            # create_optional_upload_comment(message, group, current_user, presence, message_params)
            message = MessageQueries.load_message(message.id, current_user)
            MessageEventsService.message_creation_events(message, group, notify_user_ids)
            IO.inspect("Afer Sending the Message and Notifications")
        else
          {:group, _} ->
            {:error, :not_found, "The room you are looking for does not exist."}

          {:authorized?, false} ->
            {:error, :not_authorized, "You can't see the messages for this room."}

          {:error, :message, changeset, _changeset_so_far} ->
            {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}
        end

        queue
      {:empty, queue} ->
        queue |> IO.inspect(label: "Here I am")
    end
  end

  defp changeset_errors_to_string(changeset) do
    Enum.map(changeset.errors, fn {field, detail} ->
      "#{Phoenix.Naming.humanize(field)} #{ErrorHelpers.translate_error(detail)}"
    end)
    |> Enum.join(". ")
  end

  defp convert_to_seconds(%{"message_params" => %{"schedule_message" => %{"scheduled_at" => scheduled_at} = _schedule_message} = _message_params} = _data) do
    datetime_now = NaiveDateTime.utc_now()
    scheduled = NaiveDateTime.from_iso8601!(scheduled_at)
    time = NaiveDateTime.diff(scheduled, datetime_now, :millisecond)
    time
  end

  defp schedule_queue_processing do
    Process.send_after(self(), :process_queue, 5000)
  end
end
