defmodule StitchConnect.Web.NotificationsChannel do
  use Phoenix.Channel

  import Ecto.Query
  alias Stitch.{Repo, GroupUser}
  alias StitchConnect.Web.Api.V1.MessageView

  @endpoint StitchConnect.Web.Endpoint

  def join("notifications:" <> user_id, _params, socket) do
    user_id = String.to_integer(user_id)
    if user_id == socket.assigns.current_user.id do
      {:ok, socket}
    else
      {:error, %{message: "Unauthorized"}}
    end
  end

  def broadcast_group_msg(group, user, message) do
    ids = GroupUser |> where(group_id: ^group.id) |> select([gu], gu.user_id)
    |> Repo.all |> List.delete(user.id)
    json = MessageView.render("show.json", %{message: message})

    for id <- ids do
      @endpoint.broadcast("notifications:#{id}", "new_message", json)
    end
  end
end
