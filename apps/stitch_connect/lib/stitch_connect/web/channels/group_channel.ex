defmodule StitchConnect.Web.GroupChannel do
  use Phoenix.Channel
  alias StitchConnect.Web.Api.V1.MessageView
  alias Stitch.{Repo, Group, GroupAuthorization, Message, MessageQueries}

  def join("groups:" <> group_slug, _params, socket) do
    case Repo.get_by(Group, slug: group_slug) do
      nil ->
        {:error, %{reason: "group not found"}}
      group ->
        case GroupAuthorization.can_view?(group.id, socket.assigns.current_user.id) do
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
    group = socket.assigns.group
    messages = MessageQueries.group_latest_messages(group.id, max_id: max_id)
    json = MessageView.render("index.json", %{messages: messages})

    {:reply, {:ok, %{messages: json}}, socket}
  end

  def handle_in("new_msg", %{"text_content" => content}, socket) do
    %{group: group, current_user: user} = socket.assigns

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
