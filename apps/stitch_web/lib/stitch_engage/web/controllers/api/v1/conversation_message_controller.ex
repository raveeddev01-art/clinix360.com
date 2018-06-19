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
    message_params_with_client = Stitch.Message.Params.with_client_attrs(conn, message_params)

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
             message_params_with_client
           ) do
      # TODO: get notify_user_ids in the create
      notify_user_ids = []
      conversation_message = %{conversation_message | provider: user}
      conversation_message_events(conversation_message, conversation, notify_user_ids)

      conn
      |> put_status(:created)
      |> render("show.json", conversation_message: conversation_message)
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

  def conversation_message_events(_conversation_message, _conversation, _notify_user_ids) do
    # TODO: All of these events can handle conversation equivalents

    # Stitch.Mobile.NotificationLogger.start(message, notify_user_ids.mobile)
    # Stitch.Task.start(fn ->
    #   MessageLinkPreviewGenerator.queue(message)
    #   GroupChannel.broadcast_message_created(message)
    #   EventsChannel.broadcast_group_new_msg(group, message, notify_user_ids.desktop)
    #   PushNotifications.notify_users(group, message, notify_user_ids.mobile)
    #   PushNotifications.push_badge_update(message, notify_user_ids.mobile)
    #   Stitch.EmailNotification.create(message.id, notify_user_ids.email)
    # end)
  end
end
