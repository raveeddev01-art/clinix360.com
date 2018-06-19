defmodule StitchEngage.Web.Api.V1.ConversationMessageController do
  use Stitch.Web, :controller

  alias Stitch.{
    Repo,
    Engage.Conversation,
    Engage.ConversationQueries,
    Engage.ConversationMessage,
    Engage.ConversationAuthorization
  }

  action_fallback(Stitch.Web.Api.FallbackController)

  def index(conn, params = %{"conversation_id" => conversation_id}) do
    user = conn.assigns.current_user

    with {:conversation, conversation} when not is_nil(conversation) <-
           {:conversation, Repo.get(Conversation, conversation_id)},
         {:authorized?, true} <-
           {:authorized?, ConversationAuthorization.can_view?(conversation, user)} do
      conversation_messages =
        ConversationQueries.messages_for_conversation(
          conversation.id,
          params["updated_before"]
        )

      render(conn, "index.json", conversation_messages: conversation_messages)
    else
      {:conversation, _} ->
        {:error, :not_found, "Conversation not found"}

      {:authorized?, _} ->
        {:error, :unauthorized, "You cannot view this conversation."}
    end
  end

  def create(conn, %{"conversation_id" => conversation_id, "message" => message_params}) do
    user = conn.assigns.current_user
    # authenticated_urls = get_authenticated_urls(message_params)
    # message_params_with_client = Message.Params.with_client_attrs(conn, message_params)

    with {:conversation, %Conversation{} = conversation} <-
           {:conversation, Repo.get(Conversation, conversation_id)},
         {:authorized?, true} <-
           {:authorized?, ConversationAuthorization.can_message?(conversation, user)},

         #  TODO: pass this into the message creation
         #        and return notify_user_ids
         #  presence_user_ids = UserStatusService.presence_user_ids(current_user.team_id),

         {:ok, conversation_message} <-
           ConversationMessage.create_for_provider(
             conversation.id,
             user.id,
             message_params
           ) do
      conversation_message = %{conversation_message | provider: user}
      # conversation_message_events(message, group, notify_user_ids)

      conn
      |> put_status(:created)
      |> render(
        "show.json",
        conversation_message: conversation_message
        # authenticated_urls: authenticated_urls
      )
    else
      {:conversation, _} ->
        {:error, :not_found, "The conversation you are looking for does not exist."}

      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot send messages in this conversation."}

      {:error, changeset} ->
        {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}

      _ ->
        {:error, :unprocessable_entity}
    end
  end
end
