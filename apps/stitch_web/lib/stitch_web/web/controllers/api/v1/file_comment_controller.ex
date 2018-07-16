defmodule Stitch.Web.Api.V1.FileCommentController do
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
    Files.UploadComment
  }

  action_fallback(Stitch.Web.Api.V1.FallbackController)

  def create(conn, %{
        "file_comment" => %{"text_content" => text_content},
        "upload_id" => upload_id
      }) do
    current_user = conn.assigns.current_user
    presence = UserStatusService.presence_user_ids(current_user.team_id)
    attrs = %{"text_content" => text_content}

    with {:upload, %Upload{} = upload} <-
           {:upload, FileQueries.get_by_id(upload_id, preload_assoc: true)},
         {:authorized, true} <- {:authorized, FileAuthorization.can_view?(upload, current_user)},
         {:upload_comment,
          {:ok,
           %{
             insert_file_comment_messages: inserted_messages_for_group,
             upload_comment: upload_comment
           }}} <- {:upload_comment, UploadComment.create(upload, current_user, attrs, presence)} do
      file_comment_creation_events(inserted_messages_for_group, upload)

      conn
      |> put_status(:created)
      |> render("show.json", file_comment: upload_comment)
    else
      {:upload, nil} ->
        {:error, :not_found}

      {:authorized, false} ->
        {:error, :not_found}

      {:upload_comment, {:error, action, changeset, _}} ->
        {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}
    end
  end

  def file_comment_creation_events(inserted_messages_for_group, upload) do
    upload = FileQueries.get_by_id(upload.id, preload_assoc: true)
    GroupChannel.broadcast_file_comment_added(upload)

    Enum.each(inserted_messages_for_group, fn %{
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
        "id" => upload_comment_id
      }) do
    current_user = conn.assigns.current_user

    with {:upload_comment, upload_comment} <-
           {:upload_comment, UploadComment.get(upload_comment_id)},
         {:authorized, true} <-
           {:authorized, FileAuthorization.is_comment_creator?(upload_comment, current_user)},
         {:updated_comment,
          {:ok,
           %{update_upload_comment: upload_comment, update_file_comment_messages: {_, messages}}}} <-
           {:updated_comment, UploadComment.update(upload_comment, text_content, current_user)} do
      file_comment_edit_events(messages, upload_comment.upload_id)

      conn
      |> render("show.json", file_comment: upload_comment)
    else
      {:upload_comment, nil} ->
        {:error, :not_found}

      {:authorized, false} ->
        {:error, :not_found}

      {:updated_comment, {:error, changeset}} ->
        {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}
    end
  end

  def file_comment_edit_events(messages, upload_id) do
    upload = FileQueries.get_by_id(upload_id, preload_assoc: true)
    GroupChannel.broadcast_file_comment_edited(upload)

    Enum.each(messages, fn message ->
      MessageEventsService.message_edit_events(message)
    end)
  end

  def delete(conn, %{"id" => upload_comment_id}) do
    current_user = conn.assigns.current_user
    team = conn.assigns.team

    with {:upload_comment, upload_comment} <-
           {:upload_comment, UploadComment.get(upload_comment_id)},
         {:authorized, true} <-
           {:authorized,
            FileAuthorization.can_delete_comment?(upload_comment, current_user, team)},
         file_comment_messages = FileQueries.file_comment_messages(upload_comment),
         {:deleted_comment, {:ok, %{delete_upload_comment: upload_comment}}} <-
           {:deleted_comment, UploadComment.delete(upload_comment, current_user)} do
      file_comment_delete_events(file_comment_messages, upload_comment.upload_id)

      conn
      |> render("show.json", file_comment: upload_comment)
    else
      {:upload_comment, nil} ->
        {:error, :not_found}

      {:authorized, false} ->
        {:error, :not_found}

      {:deleted_comment, {:error, changeset}} ->
        {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}
    end
  end

  def file_comment_delete_events(file_comment_messages, upload_id) do
    upload = FileQueries.get_by_id(upload_id, preload_assoc: true)

    GroupChannel.broadcast_file_comment_deleted(upload)

    Enum.each(file_comment_messages, fn message ->
      MessageEventsService.message_delete_events(message)
    end)
  end
end
