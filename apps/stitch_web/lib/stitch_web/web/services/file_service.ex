defmodule Stitch.Web.FileService do
  alias Stitch.{
    Accounts.User,
    Files.Upload,
    Files.UploadComment,
    Files.FileQueries,
    Files.FileAuthorization
  }

  use Stitch.Web, :controller
  action_fallback(Stitch.Web.Api.V1.FallbackController)

  alias StitchConnect.Web.{
    GroupChannel,
    MessageEventsService
  }

  @spec create_optional_comment(Upload.t(), User.t(), map, map) ::
          {:ok, UploadComment.t(), [Group.t()]} | :error

  def create_optional_comment(
        %Upload{} = upload,
        %User{} = current_user,
        presence,
        %{"text_content" => _text_content} = attrs
      ) do
    with {:ok, comment, groups} <- UploadComment.create(upload, current_user, attrs, presence) do
      Enum.each(groups, fn %{group: group, result: {:ok, result}} ->
        MessageEventsService.message_creation_events(
          result.message,
          group,
          result.notify_user_ids
        )
      end)

      upload = FileQueries.get_by_id(upload.id, preload_assoc: true)
      GroupChannel.broadcast_file_comment_added(upload)

      {:ok, comment, groups}
    else
      _ -> :error
    end
  end

  def create_optional_comment(_upload, _current_user, _presence, _text_content), do: :error

  # To support old clients that can accidentailly try to update "file_comment" via message controller,
  # Stitch.Web.Api.V1.FileCommentController.update/2 and
  # StitchConnect.Web.Api.V1.MessageController.update/2 both call this action on update.
  def update_file_comment(text_content, upload_comment_id, current_user) do
    with {:upload_comment, upload_comment} <-
           {:upload_comment, UploadComment.get(upload_comment_id)},
         {:authorized, true} <-
           {:authorized, FileAuthorization.is_comment_creator?(upload_comment, current_user)},
         {:updated_comment,
          {:ok,
           %{update_upload_comment: upload_comment, update_file_comment_messages: {_, messages}}}} <-
           {:updated_comment, UploadComment.update(upload_comment, text_content, current_user)} do
      file_comment_edit_events(messages, upload_comment.upload_id)

      {:updated_upload_comment, upload_comment}
    else
      {:upload_comment, nil} ->
        {:error, :not_found}

      {:authorized, false} ->
        {:error, :not_found}

      {:updated_comment, {:error, _action, changeset, _}} ->
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

  def delete_file_comment(upload_comment_id, current_user, team) do
    with {:upload_comment, upload_comment} <-
           {:upload_comment, UploadComment.get(upload_comment_id)},
         {:authorized, true} <-
           {:authorized,
            FileAuthorization.can_delete_comment?(upload_comment, current_user, team)},
         file_comment_messages = FileQueries.file_comment_messages(upload_comment),
         {:deleted_comment, {:ok, %{delete_upload_comment: upload_comment}}} <-
           {:deleted_comment, UploadComment.delete(upload_comment, current_user)} do
      file_comment_delete_events(file_comment_messages, upload_comment.upload_id)

      # conn
      # |> render("show.json", file_comment: upload_comment)

      {:deleted_upload_comment, upload_comment}
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
