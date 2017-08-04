defmodule StitchConnect.Web.Api.V1.GroupController do
  use StitchConnect.Web, :controller
  alias Stitch.Group

  plug StitchConnect.Plug.ApiAuthenticate when action in [:toggle_favorite, :index, :search, :invite]

  def index(conn, _params) do
    groups = Stitch.GroupQueries.available_groups(conn.assigns.current_user.id)
    render conn, "index.json", groups: groups
  end

  def toggle_favorite(conn, %{"id" => group_id}) do
    result = Stitch.Group.toggle_favorite(group_id, conn.assigns.current_user.id)
    conn
    |> json(%{group_id: group_id, favorited: result})
  end

  def search(conn, %{"term" => term}) do
    result_groups = Stitch.GroupQueries.search(conn.assigns.current_user.id, term)
    render conn, "index.json", groups: result_groups
  end

  def invite(conn, %{"id" => group_id, "user_ids" => user_ids}) do
    case Stitch.GroupAuthorization.can_invite?(group_id, conn.assigns.current_user.id) do
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authorized to invite people to this group."})
      true ->
        split_user_ids = String.split(user_ids, ",")
        Enum.each(split_user_ids, fn(user_id) ->
          user_id = String.to_integer(user_id)
          Stitch.Group.invite(group_id, user_id)
        end)
        conn
        |> json(%{message: "Users invited to group."})
    end
  end
end