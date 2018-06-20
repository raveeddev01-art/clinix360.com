defmodule StitchEngage.Web.Api.V1.ConversationController do
  use Stitch.Web, :controller

  alias Stitch.{
    Repo,
    Engage.Inbox,
    Engage.InboxAuthorization,
    Engage.Conversation,
    Engage.ConversationQueries,
    Engage.ConversationAuthorization
  }

  alias StitchEngage.Web.InboxChannel

  action_fallback(Stitch.Web.Api.FallbackController)

  def index(conn, params = %{"inbox_id" => inbox_id}) do
    user = conn.assigns.current_user

    with {:inbox, inbox} when not is_nil(inbox) <- {:inbox, Repo.get(Inbox, inbox_id)},
         {:authorized?, true} <- {:authorized?, InboxAuthorization.can_view?(inbox, user)} do
      conversations =
        ConversationQueries.for_index(inbox.id, params["updated_before"], params["open"])

      render(conn, "index.json", conversations: conversations)
    else
      {:inbox, _} ->
        {:error, :not_found, "Inbox not found"}

      {:authorized?, _} ->
        {:error, :unauthorized, "You cannot view conversations in this inbox."}
    end
  end

  def show(conn, %{"id" => id}) do
    user = conn.assigns.current_user

    with {:conversation, conversation} when not is_nil(conversation) <-
           {:conversation, ConversationQueries.for_show(id)},
         {:authorized?, true} <-
           {:authorized?, ConversationAuthorization.can_view?(conversation, user)} do
      render(conn, "show.json", conversation: conversation)
    else
      {:conversation, _} ->
        {:error, :not_found, "Conversation not found"}

      {:authorized?, _} ->
        {:error, :unauthorized, "You cannot view this conversation."}
    end
  end

  def create(conn, params = %{"inbox_id" => inbox_id}) do
    user = conn.assigns.current_user

    with {:inbox, inbox} when not is_nil(inbox) <- {:inbox, Repo.get(Inbox, inbox_id)},
         {:authorization?, true} <- {:authorization?, InboxAuthorization.can_view?(inbox, user)},
         {:ok, %{conversation: conversation, conversation_message: conversation_message}} <-
           Conversation.begin_conversation_as_provider(user, params) do
      conversation = Repo.preload(conversation, [:conversation_messages, team_patients: :patient])

      conversation_with_latest_message = %{
        conversation
        | latest_conversation_message: conversation_message
      }

      InboxChannel.broadcast_conversation_creation(conversation_with_latest_message)
      render(conn, "show.json", conversation: conversation_with_latest_message)
    else
      {:inbox, _} ->
        {:error, :not_found}

      {:authorized?, false} ->
        {:error, :unauthorized, "You cannot create conversations in this inbox."}

      {:error, _model_errored, changeset, _} ->
        {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}

      _error ->
        {:error, :unprocessable_entity, "There was a problem creating this conversation."}
    end
  end

  def open(conn, params) do
    change_open(conn, params, true)
  end

  def close(conn, params) do
    change_open(conn, params, false)
  end

  defp change_open(conn, %{"id" => id}, open_value) do
    user = conn.assigns.current_user

    with {:conversation, conversation} when not is_nil(conversation) <-
           {:conversation, Repo.get(Conversation, id)},
         {:authorized?, true} <-
           {:authorized?, ConversationAuthorization.can_update?(conversation, user)},
         {:ok, updated_conversation} <- Conversation.update_open_value(conversation, open_value) do
      updated_conversation =
        Repo.preload(updated_conversation, [:conversation_messages, team_patients: :patient])

      InboxChannel.broadcast_conversation_update(conversation)
      render(conn, "show.json", conversation: updated_conversation)
    else
      {:conversation, _} ->
        {:error, :not_found}

      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot update this conversation."}

      {:error, :same_open_value} ->
        open_text = if open_value, do: "open", else: "closed."
        {:error, :unprocessable_entity, "Conversation already #{open_text}"}

      {:error, changeset} ->
        {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}

      _error ->
        {:error, :unprocessable_entity}
    end
  end
end
