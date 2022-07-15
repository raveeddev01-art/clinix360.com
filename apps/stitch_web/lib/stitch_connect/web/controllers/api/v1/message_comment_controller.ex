defmodule StitchConnect.Web.Api.V1.MessageCommentController do
  use Stitch.Web, :controller

  alias StitchConnect.Web.{
    GroupChannel,
    UserStatusService,
    MessageEventsService
  }

  alias Stitch.{
    # GroupAuthorization,
    GroupQueries,
    # Group,
    Message,
    MessageAuthorization,
    # MessageAction,
    MessageQueries,
    Web.FileService
  }

  action_fallback(Stitch.Web.Api.V1.FallbackController)

  def create(conn, %{
        "message_comment" => %{
          "text_content" => text_content,
          "thread" => thread
        } = params,
        "id" => message_id
      }) do
    thread = if thread == "true" or thread == "1" , do: true, else: thread

    current_user = conn.assigns.current_user
    presence = UserStatusService.presence_user_ids(current_user.team_id)
    _authenticated_urls = get_authenticated_urls(params)
    message_params_with_client = Message.Params.with_client_attrs(conn, params)

    with {:message, %Message{} = message_parent} <-
           {:message, MessageQueries.load_message(message_id, current_user)},
         {:ok, %{message: message, notify_user_ids: notify_user_ids}} <-
           Message.create(message_parent, current_user, message_params_with_client, presence) do
      message_parent = MessageQueries.load_message(message_parent.id, current_user)
      message = MessageQueries.load_message(message.id, current_user)
      message_comment_creation_events(message_parent, message, notify_user_ids)

      conn
      |> put_status(:created)
      |> render("show.json", message_comment: message)
    else
      {:message, _} ->
        {:error, :not_found, "The room you are looking for does not exist."}

      {:authorized?, false} ->
        {:error, :not_authorized, "You can't see the messages for this room."}

      {:error, :message, changeset, _changeset_so_far} ->
        {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}
    end
  end

  def get_authenticated_urls(%{"authenticated_urls" => "true"}), do: true
  def get_authenticated_urls(_params), do: false

  ##################

  def message_comment_creation_events(message, comment, notify_user_ids) do
    message
    |> Map.merge(%{comment: comment})
    |> MessageEventsService.message_comment_creation_events(notify_user_ids)
  end

  def update(conn, %{"id" => message_id, "message_comment" => %{"text_content" => text_content}}) do
    current_user = conn.assigns.current_user
    message_params = %{"text_content" => text_content}

    with {:message, %Message{type: message_type} = message} when message_type in ["chat"] <-
           {:message, MessageQueries.get_by_id(message_id)},
         {:authorized?, true} <-
           {:authorized?, MessageAuthorization.can_edit?(message, current_user)},
         {:updated, {:ok, message}} <- {:updated, Message.update(message, message_params)} do
      message = MessageQueries.load_info(message)
      parent_message = MessageQueries.get_by_id(message.parent_message_id)
      GroupChannel.broadcast_message_comment_edited(parent_message)
      render(conn, "show.json", message_comment: message)
    else
      # When an old client is trynig to update "file_comment" via messages API
      # TODO: Deprecate once most client start using the new file API.
      {:message, %Message{type: "file_comment"} = message} ->
        text_content = message_params["text_content"]
        upload_comment_id = message.upload_comment_id

        file_comment_update_result =
          FileService.update_file_comment(text_content, upload_comment_id, current_user)

        with {:updated_upload_comment, _updated_upload_comment} <- file_comment_update_result do
          message = MessageQueries.get_by_id(message_id)
          message = MessageQueries.load_info(message)
          parent_message = MessageQueries.get_by_id(message.parent_message_id)
          GroupChannel.broadcast_message_comment_edited(parent_message)
          render(conn, "show.json", message: message)
        else
          error -> error
        end

      {:message, _} ->
        {:error, :not_found}

      {:authorized?, false} ->
        {:error, :not_found}

      {:error, :message, changeset, _changeset_so_far} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})
    end
  end

  def delete(conn, %{"id" => message_id}) do
    current_user = conn.assigns.current_user
    _team = conn.assigns.team

    with {:message, %Message{} = message} <- {:message, MessageQueries.get_by_id(message_id)},
         {:group, {:ok, group}} <-
           {:group, GroupQueries.get_by_id(message.group_id, current_user)},
         {:authorized?, true} <-
           {:authorized?, MessageAuthorization.can_delete?(message, current_user, group)},
         {:deleted, {:ok, %{message: message}}} <-
           {:deleted, Message.delete(message, current_user)} do
      parent_message = MessageQueries.get_by_id(message.parent_message_id)
      GroupChannel.broadcast_message_comment_deleted(parent_message)
      GroupChannel.broadcast_message_edited(parent_message)
      send_resp(conn, :no_content, "")
    else
      {:authorized?, false} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't delete other users' messages"})

      {:deleted, {:error, _failed_operation, _failed_value, _changeset}} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Failed to delete message"})

      _ ->
        {:error, :not_found}
    end
  end
end
