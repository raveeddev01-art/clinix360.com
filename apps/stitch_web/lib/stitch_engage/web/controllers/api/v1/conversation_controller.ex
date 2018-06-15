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

  def show(conn, %{"id" => id}) do
    conversation = ConversationQueries.for_show_view(id)
    render(conn, "show.json", conversation: conversation)
  end

  def create(conn, params = %{"inbox_id" => inbox_id}) do
    user = conn.assigns.current_user

    with {:inbox, inbox} when not is_nil(inbox) <- {:inbox, Repo.get(Inbox, inbox_id)},
         {:authorization?, true} <- {:authorization?, InboxAuthorization.can_view?(inbox, user)},
         {:ok, %{conversation: conversation}} <-
           Conversation.begin_conversation_as_provider(user, params) do
      # TODO: BROADCAST HERE
      conversation = Repo.preload(conversation, [:conversation_messages, team_patients: :patient])
      render(conn, "show.json", conversation: conversation)
    else
      {:inbox, _} ->
        {:error, :not_found}

      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot view these conversations."}

      {:error, _model_errored, changeset, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})

      _error ->
        {:error, :unprocessable_entity}
    end
  end

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
