defmodule StitchConnect.Web.EventsChannel do
  use Phoenix.Channel

  import Ecto.Query
  alias Stitch.{Repo, GroupUser, UserQueries}
  alias StitchConnect.Web.Api.V1.{MessageView, GroupView}

  @endpoint StitchConnect.Web.Endpoint

  def join("events:" <> user_id, _params, socket) do
    user_id = String.to_integer(user_id)
    if user_id == socket.assigns.current_user.id do
      {:ok, socket}
    else
      {:error, %{message: "Unauthorized"}}
    end
  end

  def broadcast_group_new_msg(group, message, notify_user_ids \\ []) do
    notify_user_ids_map = user_ids_to_map(notify_user_ids)
    ids = GroupUser |> where(group_id: ^group.id) |> select([gu], gu.user_id)
    |> Repo.all |> List.delete(message.user_id)

    for id <- ids do
      json = MessageView.message_json(message, id)
      json = if notify_user_ids_map[id], do: Map.put(json, :notify, true), else: json
      @endpoint.broadcast("events:#{id}", "new_message", json)
    end
  end

  def broadcast_group_msg_deleted(group, message) do
    ids = GroupUser |> where(group_id: ^group.id) |> select([gu], gu.user_id)
    |> Repo.all |> List.delete(message.user_id)

    for id <- ids do
      @endpoint.broadcast("events:#{id}", "message_deleted", %{id: message.id})
    end
  end

  def broadcast_msg_starred(message, user) do
    @endpoint.broadcast("events:#{user.id}", "message_starred", %{
      id: message.id,
      starred: message.starred,
    })
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

  def broadcast_marked_as_read(user, messages) do
    json = MessageView.render("index.json", %{messages: messages, user_id: user.id})
    @endpoint.broadcast("events:#{user.id}", "marked_as_read", %{messages: json})
  end

  defp user_ids_to_map(user_ids) do
    Enum.reduce(user_ids, %{}, fn (user_id, acc) ->
      Map.put(acc, user_id, true)
    end)
  end
end
