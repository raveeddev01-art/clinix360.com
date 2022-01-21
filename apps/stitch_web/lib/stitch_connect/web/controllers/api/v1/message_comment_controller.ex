defmodule StitchConnect.Web.Api.V1.MessageCommentController do
  use Stitch.Web, :controller

  alias StitchConnect.Web.{
    GroupChannel,
    UserStatusService,
    MessageEventsService
  }

  alias Stitch.{
    Files.FileQueries,
    Files.Upload,
    Files.FileAuthorization,
    Files.UploadComment,
    GroupAuthorization,
    GroupQueries,
    Group,
    Files,
    StarrableItems.StarringService,
    Message,
    MessageAuthorization,
    MessageAction,
    MessageQueries,
    Message.Upload,
    ReadStatus,
    Web.EventsChannel,
    Web.FileService
  }

  action_fallback(Stitch.Web.Api.V1.FallbackController)

  def create(conn, %{"message_id" => message_id, "file_comment" => %{"text_content" => message_params}}) do
    current_user = conn.assigns.current_user
    presence = UserStatusService.presence_user_ids(current_user.team_id)
    authenticated_urls = get_authenticated_urls(message_params)
    message_params_with_client = Message.Params.with_client_attrs(conn, message_params)
    with {:message, %Message{} = message} <- {:message, MessageQueries.get_by_id(message_id)},
         {:authorized?, true} <-
           {:authorized?, GroupAuthorization.can_message?(message, current_user.id)},
         {:ok, %{message: message, notify_user_ids: notify_user_ids}} <-
           Message.create(message, current_user, message_params_with_client, presence) do
      message = %{message | user: current_user}
      # create_optional_upload_comment(message, message, current_user, presence, message_params)
      message = MessageQueries.get_by_id(message.id)
      MessageEventsService.message_creation_events(message, message, notify_user_ids)
      conn
      |> put_status(:created)
      |> render("show.json", message: message, authenticated_urls: authenticated_urls)
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
  # def create(conn, %{
  #       "message_comment" => %{"text_content" => text_content},
  #       "message_id" => message_id
  #     }) do
  #   current_user = conn.assigns.current_user
  #   presence = UserStatusService.presence_user_ids(current_user.team_id)
  #   attrs = %{"text_content" => text_content}

  #   with {:message, %Message{} = message} <-
  #          {:message, MessageQueries.get_by_id(message_id)},
  #       #  {:authorized, true} <- {:authorized, FileAuthorization.can_view?(message, current_user)},
  #        {:message_comment,
  #         {:ok,
  #          %{
  #            insert_file_comment_messages: inserted_messages_for_groups,
  #            message_comment: message_comment
  #          }}} <- {:message_comment, UploadComment.create(message, current_user, attrs, presence)} do
  #     file_comment_creation_events(inserted_messages_for_groups, message)

  #     conn
  #     |> put_status(:created)
  #     |> render("show.json", file_comment: message_comment)
  #   else
  #     {:message, nil} ->
  #       {:error, :not_found}

  #     {:authorized, false} ->
  #       {:error, :not_found}

  #     {:message_comment, {:error, action, changeset, _}} ->
  #       {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}
  #   end
  # end

  def file_comment_creation_events(inserted_messages_for_groups, message) do
    message = FileQueries.get_by_id(message.id, preload_assoc: true)
    GroupChannel.broadcast_file_comment_added(message)

    Enum.each(inserted_messages_for_groups, fn %{
                                                 group: group,
                                                 message_creation_result: message_creation_result
                                               } ->
      MessageEventsService.message_creation_events(
        message_creation_result.message,
        group,
        message_creation_result.notify_user_ids
      )
    end)
  end

  def update(conn, %{
        "file_comment" => %{"text_content" => text_content},
        "id" => message_comment_id
      }) do
    current_user = conn.assigns.current_user

    file_comment_update_result =
      Stitch.Web.FileService.update_file_comment(
        text_content,
        message_comment_id,
        current_user
      )

    with {:updated_message_comment, message_comment} <- file_comment_update_result do
      conn
      |> render("show.json", file_comment: message_comment)
    else
      error -> error
    end
  end

  def delete(conn, %{"id" => message_comment_id}) do
    current_user = conn.assigns.current_user
    team = conn.assigns.team

    file_comment_delete_result =
      Stitch.Web.FileService.delete_file_comment(
        message_comment_id,
        current_user,
        team
      )

    with {:deleted_message_comment, message_comment} <- file_comment_delete_result do
      conn
      |> render("show.json", file_comment: message_comment)
    else
      error -> error
    end
  end
end
