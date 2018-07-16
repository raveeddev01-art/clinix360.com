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

    file_comment_update_result =
      Stitch.Web.FileService.update_file_comment(
        text_content,
        upload_comment_id,
        current_user
      )

    with {:updated_upload_comment, upload_comment} <- file_comment_update_result do
      conn
      |> render("show.json", file_comment: upload_comment)
    else
      error -> error
    end
  end

  def delete(conn, %{"id" => upload_comment_id}) do
    current_user = conn.assigns.current_user
    team = conn.assigns.team

    file_comment_delete_result =
      Stitch.Web.FileService.delete_file_comment(
        upload_comment_id,
        current_user,
        team
      )

    with {:deleted_upload_comment, upload_comment} <- file_comment_delete_result do
      conn
      |> render("show.json", file_comment: upload_comment)
    else
      error -> error
    end
  end
end
