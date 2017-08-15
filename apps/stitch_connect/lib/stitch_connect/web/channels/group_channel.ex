defmodule StitchConnect.Web.GroupChannel do
  use Phoenix.Channel
  alias StitchConnect.Web.Api.V1.MessageView
  alias Stitch.{Repo, Group, GroupUser, GroupAuthorization, Message, MessageQueries}

  def join("groups:__dm:" <> id_pair, _params, socket) do
    ids_pair = id_pair |> String.split(".") |> Enum.map(&String.to_integer/1)

    # make sure clients sort ids, to make sure they connect to same channel
    if Enum.sort(ids_pair) == ids_pair do
      %{team_id: team_id, current_user: user} = socket.assigns

      case List.delete(ids_pair, user.id) do
        [other_user_id] ->
          case Repo.get_by(Group, slug: "__dm:#{id_pair}", team_id: team_id) do
            nil ->
              {:ok, %{messages: []}, assign(socket, :group, {:create_dm, id_pair, other_user_id})}

            group ->
              messages = MessageQueries.group_latest_messages(group.id)
              json = MessageView.render("index.json", %{messages: messages})
              {:ok, %{messages: json}, assign(socket, :group, group)}
          end
        _ ->
          {:error, %{reason: "You can't participate on this chat."}}
      end
    else
      {:error, %{reason: "User ids should be sorted."}}
    end
  end

  def join("groups:" <> group_slug, _params, socket) do
    %{team_id: team_id, current_user: user} = socket.assigns

    case Repo.get_by(Group, slug: group_slug, team_id: team_id) do
      nil ->
        {:error, %{reason: "group not found"}}
      group ->
        case GroupAuthorization.can_view?(group.id, user.id) do
          true ->
            messages = MessageQueries.group_latest_messages(group.id)
            json = MessageView.render("index.json", %{messages: messages})
            {:ok, %{messages: json}, assign(socket, :group, group)}
          false ->
            {:error, %{reason: "unauthorized"}}
        end
    end
  end

  def handle_in("feed", %{"max_id" => max_id}, socket) do
    case socket.assigns.group do
      {:create_dm, _, _} ->
        {:reply, {:ok, %{messages: []}}, socket}

      group ->
        messages = MessageQueries.group_latest_messages(group.id, max_id: max_id)
        json = MessageView.render("index.json", %{messages: messages})
        {:reply, {:ok, %{messages: json}}, socket}
    end
  end

  def handle_in("new_msg", params, socket) do
    %{group: group, current_user: user} = socket.assigns
    do_new_msg(socket, group, user, params)
  end

  defp do_new_msg(socket, {:create_dm, id_pair, other_user_id}, user, params) do
    slug = "__dm:#{id_pair}"
    attrs = %{team_id: socket.assigns.team_id, name: "DM Group", slug: slug, public: false}
    result = %Group{} |> Group.changeset(attrs) |> Repo.insert

    case result do
      {:ok, group} ->
        for id <- [user.id, other_user_id] do
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
            {:reply, {:error, %{reason: "Failed to create group."}}, socket}
        end
    end
  end

  defp do_new_msg(socket, group, user, %{"text_content" => content}) do
    if GroupAuthorization.is_member?(group.id, user.id) do
      attrs = %{user_id: user.id, group_id: group.id, text_content: content}
      changeset = Message.changeset(%Message{}, attrs)

      case Repo.insert(changeset) do
        {:ok, message} ->
          json = MessageView.render("show.json", %{message: message})

          broadcast! socket, "new_msg", json
          {:reply, {:ok, json}, socket}

        {:error, _changeset} ->
          {:reply, {:error, %{reason: "Failed to create message."}}, socket}
      end
    else
      {:reply, {:error, %{reason: "Only members can write messages."}}, socket}
    end
  end
end
