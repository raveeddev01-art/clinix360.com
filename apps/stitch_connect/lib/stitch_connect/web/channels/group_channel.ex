defmodule StitchConnect.Web.GroupChannel do
  use Phoenix.Channel
  alias StitchConnect.Web.Presence
  alias Stitch.{Repo, Group}

  def join("groups:" <> group_slug, _params, socket) do
    case Repo.get_by(Group, slug: group_slug) do
      nil -> {:error, %{reason: "group not found"}}
      group ->
        case Stitch.GroupAuthorization.can_view?(group.id, socket.assigns.current_user.id) do
          true -> {:ok, assign(socket, :group, group)}
          false -> {:error, %{reason: "unauthorized"}}
        end
    end
  end
end
