defmodule Stitch.Tokbox.Events do
  @moduledoc """
  Module to handle tokbox session events. This module is aimed to
  set the status of the call, start and end times based on the user
  joining or leaving activity.
  """

  alias Stitch.{
    Repo,
    Call,
    GroupUser,
    Web.EventsChannel
  }

  alias StitchConnect.Web.GroupChannel

  def handle_event(%{"event" => "connectionCreated"} = params) do
    session_id = params["sessionId"]
    %{"user_id" => user_id} = Poison.decode!(params["connection"]["data"])

    if call = session_id |> Call.get_by_session() |> Repo.preload(:messages) do
      active_now =
        if(user_id in call.active_now, do: call.active_now, else: call.active_now ++ [user_id])

      attendees =
        if(user_id in call.attendees, do: call.attendees, else: call.attendees ++ [user_id])

      active_count = Enum.count(active_now)

      started_at = if(!call.started_at && active_count > 1, do: params["timestamp"], else: nil)
      status = if(active_count < 2, do: "ringing", else: "talking")

      do_update(call, %{
        status: status,
        started_at: started_at,
        active_now: active_now,
        attendees: attendees
      })
    end
  end

  def handle_event(%{"event" => "connectionDestroyed"} = params) do
    session_id = params["sessionId"]
    %{"user_id" => user_id} = Poison.decode!(params["connection"]["data"])

    if call = session_id |> Call.get_by_session() |> Repo.preload(messages: [:group]) do
      active_now = call.active_now -- [user_id]
      active_count = Enum.count(active_now)

      status =
        cond do
          active_count < 1 && call.status not in ["ended", "declined"] -> "missed"
          active_count < 2 && call.status not in ["missed", "declined"] -> "ended"
          true -> call.status
        end

      ended_at = if(status == "ended", do: params["timestamp"], else: nil)

      do_update(call, %{
        status: status,
        ended_at: ended_at,
        active_now: active_now
      })
    end
  end

  def handle_event(_params), do: :ok

  def do_update(call, params) do
    call =
      call
      |> Call.changeset(params)
      |> Repo.update!()

    Enum.map(call.messages, fn message ->
      fields =
        Map.merge(message.fields, %{
          "ended_at" => call.ended_at,
          "call_status" => call.status,
          "active_now" => call.active_now,
          "attendees" => call.attendees,
          "started_at" => call.started_at
        })

      message
      |> Ecto.Changeset.change(%{fields: fields})
      |> Repo.update!()
      |> GroupChannel.broadcast_message_updated()

      if call.status in ["ended", "missed"] do
        message.group.id
        |> GroupUser.user_ids()
        |> Enum.map(fn user_id ->
          EventsChannel.broadcast_ended_call(user_id, call.caller_id, call.hash)
        end)
      end

      if call.status in ["declined"] do
        message.group.id
        |> GroupUser.user_ids()
        |> Enum.map(fn user_id ->
          EventsChannel.broadcast_declined_call(user_id, call.caller_id, call.hash)
        end)
      end
    end)
  end
end
