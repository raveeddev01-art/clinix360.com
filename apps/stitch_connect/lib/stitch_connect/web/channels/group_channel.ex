defmodule StitchConnect.Web.GroupChannel do
  use Phoenix.Channel
  alias StitchConnect.Web.Api.V1.MessageView
  alias Stitch.{Repo, Group, MessageQueries}

  def join("groups:" <> group_slug, _params, socket) do
    case Repo.get_by(Group, slug: group_slug) do
      nil ->
        {:error, %{reason: "group not found"}}
      group ->
        case Stitch.GroupAuthorization.can_view?(group.id, socket.assigns.current_user.id) do
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
end
