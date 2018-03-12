defmodule StitchConnect.Web.Api.V1.PinnedMessageController do
  use StitchConnect.Web, :controller
  alias Stitch.{Repo, Group, GroupAuthorization, MessageQueries}

  def index(conn, %{"group_id" => group_id} = params) do
    pagination_opts = parse_pagination_params(params, [:limit, :skip])
    fetch_users = get_fetch_users_param(params)
    pagination_opts = Keyword.put(pagination_opts, :fetch_users, fetch_users)
    group = Repo.get! Group, group_id

    case GroupAuthorization.can_view?(group, conn.assigns.current_user) do
      true ->
        pinned_messages = MessageQueries.pinned_messages(group, pagination_opts)
        render conn, "index.json", pinned_messages: pinned_messages, user_id: conn.assigns.current_user.id
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't see the messages for this room."})
    end
  end
end
