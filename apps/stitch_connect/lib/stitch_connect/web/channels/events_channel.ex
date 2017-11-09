defmodule StitchConnect.Web.EventsChannel do
  use Phoenix.Channel

  import Ecto.Query
  alias Stitch.{Repo, Group, GroupUser, UserQueries, Accounts.User}
  alias StitchConnect.Web.Api.V1.{MessageView, GroupView}

  @endpoint StitchConnect.Web.Endpoint

  def join("events:" <> user_id, _params, socket) do
    user_id = String.to_integer(user_id)
    if user_id == socket.assigns.current_user.id do
      send self(), :after_join
      {:ok, socket}
    else
      {:error, %{message: "Unauthorized"}}
    end
  end

  def handle_info(:after_join, socket) do
    current_app_version = StitchConnect.version()
    socket_app_version = socket.assigns.application_version
    if current_app_version != socket_app_version do
      push socket, "new_app_version", %{new_version: current_app_version}
    end
    {:noreply, socket}
  end

  def group_users_for(group_id, user_id) do
    GroupUser
    |> where(group_id: ^group_id)
    |> where([gu], gu.user_id != ^user_id)
    |> select([gu], %{
      user_id: gu.user_id,
      unread_messages_count: gu.unread_messages_count,
      mentions_count: gu.mentions_count,
    })
    |> Repo.all
  end

  def broadcast_user_info(%User{} = user) do
    json = %{first_name: user.first_name, last_name: user.last_name, roles: user.roles, username: user.username}
    @endpoint.broadcast("events:#{user.id}", "user_info", json)
  end

  def broadcast_group_new_msg(group, message, notify_user_ids \\ []) do
    notify_user_ids_set = MapSet.new(notify_user_ids)
    for group_user <- group_users_for(group.id, message.user_id) do
      json = MessageView.message_json(message)
      |> Map.put(:notify, MapSet.member?(notify_user_ids_set, group_user.user_id))
      |> Map.put(:unread_messages_count, group_user.unread_messages_count)
      |> Map.put(:mentions_count, group_user.mentions_count)
      @endpoint.broadcast("events:#{group_user.user_id}", "new_message", json)
    end
  end

  def broadcast_group_msg_deleted(group, message) do
    for group_user <- group_users_for(group.id, message.user_id) do
      json = %{
        id: message.id,
        unread_messages_count: group_user.unread_messages_count,
        mentions_count: group_user.mentions_count,
      }
      @endpoint.broadcast("events:#{group_user.user_id}", "message_deleted", json)
    end
  end

  def broadcast_msg_starred(message, user) do
    @endpoint.broadcast("events:#{user.id}", "message_starred", %{
      id: message.id,
      starred: message.starred,
    })
  end

  def broadcast_group_join(group, user_id) do
    json = GroupView.group_json(group, user_id)
    @endpoint.broadcast("events:#{user_id}", "joined_group", json)
  end

  def broadcast_group_creation(group) do
    ids = Enum.map(group.users, &( &1.id ))

    for id <- ids do
      json = GroupView.group_json(group, id)
      @endpoint.broadcast("events:#{id}", "new_group", json)
    end

    if group.public do
      remaining_user_ids = group.team_id
      |> UserQueries.users_for_team
      |> Enum.map(& &1.id )
      |> Enum.reject(& &1 in ids )

      for id <- remaining_user_ids do
        json = group |> Map.put(:joined, false) |> GroupView.group_json(id)
        @endpoint.broadcast("events:#{id}", "new_group", json)
      end
    end
  end

  def broadcast_group_rename(%Group{} = group) do
    ids = Enum.map(group.users, &( &1.id ))

    json = %{
      group_id: group.id,
      group_name: group.name,
      group_slug: group.slug,
    }

    for id <- ids do
      @endpoint.broadcast("events:#{id}", "group_renamed", json)
    end

    if group.public do
      remaining_user_ids =
        group.team_id
        |> UserQueries.users_for_team
        |> Enum.map(& &1.id )
        |> Enum.reject(& &1 in ids)

      for id <- remaining_user_ids do
        @endpoint.broadcast("events:#{id}", "group_renamed", json)
      end
    end
  end

  def broadcast_marked_as_read(user, json_response) do
    @endpoint.broadcast("events:#{user.id}", "marked_as_read", json_response)
  end

  def broadcast_marked_as_unread(user, json_response) do
    @endpoint.broadcast("events:#{user.id}", "marked_as_unread", json_response)
  end
end
