defmodule StitchConnect.Web.Api.V1.GroupController do
  use StitchConnect.Web, :controller
  alias Stitch.Group

  plug StitchConnect.Plug.ApiAuthenticate when action in [:index, :search, :invite]

  def index(conn, _params) do
    groups = Stitch.GroupQueries.available_groups(conn.assigns.current_user.id)
    render conn, "index.json", groups: groups
  end

  def search(conn, %{"term" => term}) do
    result_groups = Stitch.GroupQueries.search(conn.assigns.current_user.id, term)
    render conn, "index.json", groups: result_groups
  end

  def invite(conn, %{"id" => group_id, "user_id" => user_id}) do
    case Stitch.GroupAuthorization.can_invite?(group_id, conn.assigns.current_user.id) do
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authorized to invite people to this group."})
      true ->
        Stitch.Group.invite(group_id, user_id)
        conn
        |> json(%{message: "User invited to group."})
    end
  end
end