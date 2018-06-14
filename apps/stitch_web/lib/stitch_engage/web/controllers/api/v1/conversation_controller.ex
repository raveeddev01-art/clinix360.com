defmodule StitchEngage.Web.Api.V1.ConversationController do
  use Stitch.Web, :controller

  alias Stitch.{
    Repo,
    Engage.Inbox,
    Engage.InboxAuthorization,
    Engage.Conversation,
    Engage.ConversationQueries
  }

  action_fallback(Stitch.Web.Api.FallbackController)

  def index(conn, %{"inbox_id" => inbox_id}) do
    user = conn.assigns.current_user

    with {:inbox, inbox} when not is_nil(inbox) <- {:inbox, Repo.get(Inbox, inbox_id)},
         {:authorization?, true} <- {:authorization?, InboxAuthorization.can_view?(inbox, user)} do
      conversations = ConversationQueries.for_inbox_view(inbox.id)

      render(conn, "index.json", conversations: conversations)
    else
      {:inbox, _} ->
        {:error, :not_found}

      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot view these conversations."}
    end
  end

  # def show(conn, params = %{id: id}) do
  #   team = conn.assigns.team
  #   # TODO: FIND CONVERSATION
  #   render(conn, "show.json", conversation: conversation)
  # end

  # def create(conn, params = %{id: id}) do
  #   team = conn.assigns.team
  #   # TODO: DO CREATE
  #   render(conn, "show.json", conversation: conversation)
  # end

  # def open(conn, params) do
  #   change_open(conn, params, true)
  # end

  # def close(conn, params) do
  #   change_open(conn, params, false)
  # end

  # defp change_open(conn, params = %{id: id}, open_value) do
  #   merged_params = Map.merge(params, %{open: open_value})
  #   # TODO: DO UPDATE
  #   render(conn, "show.json", conversation: conversation)
  # end
end
