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

  def broadcast_group_new_msg(group, message) do
    ids = GroupUser |> where(group_id: ^group.id) |> select([gu], gu.user_id)
    |> Repo.all |> List.delete(message.user_id)

    for id <- ids do
      json = MessageView.message_json(message, id)
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

  def broadcast_group_creation(group) do
    ids = Enum.map(group.users, &( &1.id ))
    json = GroupView.group_json(group)

    for id <- ids do
      @endpoint.broadcast("events:#{id}", "new_group", json)
    end

    if group.public do
      remaining_user_ids = group.team_id
      |> UserQueries.users_for_team
      |> Enum.map(& &1.id )
      |> Enum.reject(& &1 in ids )

      json = group |> Map.put(:joined, false) |> GroupView.group_json

      for id <- remaining_user_ids do
        @endpoint.broadcast("events:#{id}", "new_group", json)
      end
    end
  end

  def broadcast_mention_counter_update(group, mentioned_user_ids) do
    for user_id <- mentioned_user_ids do
      broadcast_mention_counter_for_user(user_id, group)
    end
  end

  def broadcast_mention_counter_for_user(user_id, []), do: nil
  def broadcast_mention_counter_for_user(user_id, [message|_]) do
    group = Repo.preload(message, :group).group
    broadcast_mention_counter_for_user(user_id, group)
  end
  def broadcast_mention_counter_for_user(user_id, %{} = group) do
    json = %{
      group_id: group.id,
      group_slug: group.slug,
      mentions_count: GroupUser.mentions_count(group.id, user_id)
    }
    @endpoint.broadcast("events:#{user_id}", "mentions_count", json)
  end

  def b(a,b,c) do
    @endpoint.broadcast(a,b,c)
  end

  def broadcast_marked_as_read(user, messages) do
    json = MessageView.render("index.json", %{messages: messages, user_id: user.id})
    @endpoint.broadcast("events:#{user.id}", "marked_as_read", %{messages: json})
  end
end
