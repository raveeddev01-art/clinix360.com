defmodule Stitch.Web.CallController do
  use Stitch.Web, :controller

  import Ecto.Query

  alias Stitch.{
    Repo,
    Call,
    Tokbox,
    Message,
    GroupUser,
    GroupQueries,
    GroupAuthorization
  }

  alias StitchConnect.Web.{
    GroupChannel,
    UserStatusService,
    MessageEventsService
  }

  alias Stitch.Web.{
    PageView,
    PageService,
    EventsChannel
  }

  # Create hash and token for the group and redirect
  def calling(conn, %{"group_id" => group_id}) do
    user = conn.assigns.current_user

    with {:group, {:ok, group}} <- {:group, GroupQueries.get_by_id(group_id, user)},
         {:can_call, true} <- {:can_call, GroupAuthorization.can_message?(group, user.id)},
         {:ok, call} <- Call.new(user) do
      attrs = %{
        "type" => "call",
        "call_id" => call.id,
        "text_content" => "Started a call",
        "fields" => %{
          "hash" => call.hash,
          "ended_at" => call.ended_at,
          "call_status" => call.status,
          "active_now" => call.active_now,
          "attendees" => call.attendees,
          "started_at" => call.started_at
        }
      }

      presence_user_ids = UserStatusService.presence_user_ids(user.team_id)

      {:ok, %{message: message, notify_user_ids: notify_user_ids}} =
        Message.create(group, user, attrs, presence_user_ids)

      MessageEventsService.message_creation_events(message, group, notify_user_ids)

      if group.name == "__dm_group__" do
        [receiver_id] = GroupUser.user_ids(group.id) -- [user.id]
        EventsChannel.broadcast_incoming_call(receiver_id, user.id, call.hash)
      end

      redirect(conn, to: "/call/#{call.hash}")
    else
      _ -> conn |> redirect(to: "/")
    end
  end

  def in_call(conn, %{"hash" => hash}) do
    # Pick call details and render the page
    user = conn.assigns.current_user
    call = Call.get_by_hash(hash) |> Repo.preload(:messages)

    case call do
      %Call{session_id: session_id, caller_id: caller_id, messages: messages} ->
        {:ok, user_token} = Tokbox.Client.token_generate(session_id, user.id)
        %{group: group} = messages |> List.first() |> Repo.preload(:group)

        call_details = %{
          token: user_token,
          groupId: group.id,
          callerId: caller_id,
          status: call.status,
          sessionId: session_id,
          isDM: group.name == "__dm_group__",
          apiKey: System.get_env("TOKBOX_API_KEY")
        }

        app_params =
          conn
          |> PageService.app_params_map()
          |> Map.put("call", call_details)
          |> Poison.encode!()

        conn
        |> put_layout("call_layout.html")
        |> render(PageView, "index.html", app_params: app_params)

      _ ->
        nil
    end
  end
end
