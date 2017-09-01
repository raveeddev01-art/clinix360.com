defmodule StitchConnect.Web.GroupChannel do
  use Phoenix.Channel
  import Ecto.Query
  alias StitchConnect.Web.Api.V1.MessageView
  alias StitchConnect.Web.EventsChannel
  alias Stitch.{Repo, Group, GroupUser, GroupAuthorization, Message, MessageQueries}

  intercept ["new_msg", "edit_msg"]

  def join("groups:__dm:" <> id_pair, _params, socket) do
    ids_pair = id_pair |> String.split(".") |> Enum.map(&String.to_integer/1)

    # make sure clients sort ids, to make sure they connect to same channel
    if Enum.sort(ids_pair) == ids_pair do
      %{team_id: team_id, current_user: user} = socket.assigns

      if user.id in ids_pair do
        case Repo.get_by(Group, slug: "__dm:#{id_pair}", team_id: team_id) do
          nil ->
            if length(ids_pair) == 2 do # if single user dm, create group on first message
              [other_user_id] = List.delete(ids_pair, user.id)
              {:ok, %{messages: []}, assign(socket, :group, {:create_dm, id_pair, other_user_id})}
            else
              {:error, %{message: "group not found"}}
            end

          group ->
            messages = MessageQueries.group_latest_messages(group.id, user)
            json = MessageView.render("index.json", %{messages: messages, user_id: user.id})
            {:ok, %{messages: json}, assign(socket, :group, group)}
        end
      else
        {:error, %{message: "You can't participate on this chat."}}
      end
    else
      {:error, %{message: "User ids should be sorted."}}
    end
  end

  def join("groups:" <> group_slug, _params, socket) do
    %{team_id: team_id, current_user: user} = socket.assigns

    case Repo.get_by(Group, slug: group_slug, team_id: team_id) do
      nil ->
        {:error, %{message: "group not found"}}
      group ->
        case GroupAuthorization.can_view?(group.id, user.id) do
          true ->
            messages = MessageQueries.group_latest_messages(group.id, user)
            json = MessageView.render("index.json", %{messages: messages, user_id: user.id})
            {:ok, %{messages: json}, assign(socket, :group, group)}
          false ->
            {:error, %{message: "unauthorized"}}
        end
    end
  end

  def handle_in("feed", %{"max_id" => max_id}, socket) do
    %{group: group, current_user: user} = socket.assigns

    case group do
      {:create_dm, _, _} ->
        {:reply, {:ok, %{messages: []}}, socket}

      group ->
        messages = MessageQueries.group_latest_messages(group.id, user, max_id: max_id)
        json = MessageView.render("index.json", %{messages: messages, user_id: user.id})
        {:reply, {:ok, %{messages: json}}, socket}
    end
  end


  def handle_in("new_msg", params, socket) do
    %{group: group, current_user: user} = socket.assigns
    do_new_msg(socket, group, user, params)
  end

  def handle_in("mark_as_read", %{"message_ids" => message_ids}, socket) do
    user = socket.assigns.current_user
    {_, messages} = Message.mark_as_read(user, message_ids)
    messages = MessageQueries.load_info(messages)

    EventsChannel.broadcast_marked_as_read(user, messages)
    EventsChannel.broadcast_mention_counter_for_user(user.id, messages)

    json = MessageView.render("index.json", %{messages: messages, user_id: user.id})
    {:reply, {:ok, %{messages: json}}, socket}
  end

  def handle_in("edit_msg", %{"message_id" => message_id, "params" => params}, socket) do
    %{group: group, current_user: user} = socket.assigns
    message = Message |> where(id: ^message_id, user_id: ^user.id, group_id: ^group.id) |> Repo.one
    case message && Message.update(message, params) do
      {:ok, %{message: message, mentioned_user_ids: mentioned_user_ids}} ->
        message = MessageQueries.load_info(message)

        broadcast! socket, "edit_msg", message
        EventsChannel.broadcast_mention_counter_update(group, mentioned_user_ids)

        json = MessageView.render("show.json", %{message: message, user_id: user.id})
        {:reply, {:ok, json}, socket}

      nil ->
        {:reply, {:error, %{message: "Message not found."}}, socket}
      {:error, _changeset} ->
        {:reply, {:error, %{message: "Failed to edit message."}}, socket}
    end
  end

  def handle_in("delete_msg", %{"message_id" => message_id}, socket) do
    %{group: group, current_user: user} = socket.assigns
    message = Message |> where(id: ^message_id, user_id: ^user.id, group_id: ^group.id) |> Repo.one
    case message && Message.delete(message) do
      {:ok, message} ->
        broadcast! socket, "delete_msg", %{id: message.id}
        EventsChannel.broadcast_group_msg_deleted(group, message)
        EventsChannel.broadcast_mention_counter_update(group, message.mentioned_user_ids)

        {:reply, {:ok, %{id: message.id}}, socket}

      nil ->
        {:reply, {:error, %{message: "Message not found."}}, socket}
      {:error, _changeset} ->
        {:reply, {:error, %{message: "Failed to delete message."}}, socket}
    end
  end

  defp do_new_msg(socket, {:create_dm, id_pair, other_user_id}, user, params) do
    slug = "__dm:#{id_pair}"
    attrs = %{team_id: socket.assigns.team_id, name: "__dm_group__", slug: slug, public: false}
    result = %Group{} |> Group.changeset(attrs) |> Repo.insert

    case result do
      {:ok, group} ->
        for id <- Enum.uniq([user.id, other_user_id]) do
          %GroupUser{}
          |> GroupUser.changeset(%{group_id: group.id, user_id: id})
          |> Repo.insert!
        end
        assign(socket, :group, group) |> do_new_msg(group, user, params)

      {:error, changeset} ->
        case changeset.errors do
          [slug: {"has already been taken", []}] ->
            group = Repo.get_by!(Group, slug: slug)
            assign(socket, :group, group) |> do_new_msg(group, user, params)

          _ ->
            {:reply, {:error, %{message: "Failed to create group."}}, socket}
        end
    end
  end

  defp do_new_msg(socket, group, user, %{"text_content" => content} = attrs) do
    if GroupAuthorization.is_member?(group.id, user.id) do
      attrs = %{ "text_content" => content, "type" => attrs["type"], "fields" => attrs["fields"] }

      case Message.create(group.id, user, attrs) do
        {:ok, %{message: message, notify_user_ids: notify_user_ids}} ->
          message = MessageQueries.load_info(message)

          broadcast! socket, "new_msg", message
          EventsChannel.broadcast_group_new_msg(group, message, notify_user_ids)
          EventsChannel.broadcast_mention_counter_update(group, message.mentioned_user_ids)

          json = MessageView.render("show.json", %{message: message, user_id: user.id})
          {:reply, {:ok, json}, socket}

        {:error, _changeset} ->
          {:reply, {:error, %{message: "Failed to create message."}}, socket}
      end
    else
      {:reply, {:error, %{message: "Only members can write messages."}}, socket}
    end
  end

  def handle_out(event, payload, socket) when event in ["new_msg", "edit_msg"] do
    json = MessageView.render("show.json",
      %{message: payload, user_id: socket.assigns.current_user.id})
    push socket, event, json
    {:noreply, socket}
  end
end
