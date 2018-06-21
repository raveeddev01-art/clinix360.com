defmodule StitchEngage.Web.Api.V1.ConversationMessageController do
  use Stitch.Web, :controller

  alias Stitch.{
    Repo,
    Engage.Conversation,
    Engage.ConversationQueries,
    Engage.ConversationMessage,
    Engage.ConversationAuthorization,
    Engage.ConversationMessageAuthorization
  }

  alias Stitch.Message.LinkPreview
  alias Stitch.LinkPreviewGenerator
  alias StitchEngage.Web.ConversationChannel

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
      notify_user_ids = %{}
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

  def show(conn, %{"id" => id}) do
    with {:conversation_message, conversation_message} <-
           {:conversation_message, Repo.get(ConversationMessage, id)},
         {:authorized?, true} <- {:authorized?, true} do
      message_with_assocs = ConversationQueries.load_message_info(conversation_message)
      render(conn, "show.json", conversation_message: message_with_assocs)
    else
      {:conversation_message, _} ->
        {:error, :not_found, "The message you are looking for does not exist."}

      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot view this message."}
    end
  end

  def delete_message_link_preview(
        conn,
        %{"id" => conversation_message_id, "link" => link} = _params
      ) do
    current_user = conn.assigns.current_user

    with {:conversation_message, %ConversationMessage{} = conversation_message} <-
           {:conversation_message, Repo.get(ConversationMessage, conversation_message_id)},
         {:conversation, conversation} <-
           {:conversation, Repo.get(Conversation, conversation_message.conversation_id)},
         {:authorized?, true} <-
           {:authorized?,
            ConversationMessageAuthorization.can_delete?(
              conversation_message,
              conversation,
              current_user
            )} do
      conversation_message = LinkPreview.delete!(conversation_message, link)

      ConversationChannel.broadcast_msg_link_preview_deleted(
        conversation,
        conversation_message.id,
        link
      )

      json(conn, %{status: "ok"})
    else
      {:conversation_message, _} -> {:error, :not_found}
      {:conversation, _} -> {:error, :not_found}
      {:authorized?, false} -> {:error, :not_authorized, "You cannot edit this message."}
    end
  end

  defp conversation_message_events(conversation_message, conversation, _notify_user_ids) do
    # Stitch.Mobile.NotificationLogger.start(message, notify_user_ids.mobile)

    # Get the updated_at time before spawning the task
    now = DateTime.utc_now() |> DateTime.to_naive()

    Stitch.Task.start(fn ->
      Conversation.touch_and_broadcast_update(
        conversation,
        conversation_message,
        now
      )

      ConversationChannel.broadcast_message_created(conversation_message)
      LinkPreviewGenerator.queue(conversation_message)

      # TODO: get equivalents of each of these working
      #   PushNotifications.notify_users(group, message, notify_user_ids.mobile)
      #   PushNotifications.push_badge_update(message, notify_user_ids.mobile)
      #   Stitch.EmailNotification.create(message.id, notify_user_ids.email)
    end)
  end
end
