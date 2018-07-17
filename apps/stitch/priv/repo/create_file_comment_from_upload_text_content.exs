defmodule Stitch.Repo.Scripts.CreateFileCommentFromUpload do
  @moduledoc """
  Creates file comment for each upload with text_content.

  ## For staging (Remove already existing file comments first):

  iex> Code.load_file("apps/stitch/priv/repo/create_file_comment_from_upload_text_content.exs")
  iex> Stitch.Repo.Scripts.CreateFileCommentFromUpload.clean_staging()
  iex> Stitch.Repo.Scripts.CreateFileCommentFromUpload.run()

  ## For prod

  iex> Code.load_file("apps/stitch/priv/repo/create_file_comment_from_upload_text_content.exs")
  iex> Stitch.Repo.Scripts.CreateFileCommentFromUpload.run()

  # Alternatively, run from shell (will execute the `run` command)
  sh> mix run apps/stitch/priv/repo/create_file_comment_from_upload_text_content.exs
  """

  use Ecto.Migration

  import Ecto.Query
  import Ecto.Changeset
  require Logger

  alias Stitch.{
    Files.Upload,
    Files.UploadComment,
    Files.FileQueries,
    Repo,
    Group,
    Message,
    GroupQueries,
    UserQueries,
    Accounts.User
  }

  # This is to achieve a loose idempotence in case when we run this script on the same data more than once
  # Assuming the probability of having more than one upload_comment with the same param is extrimely low.
  def upload_comment_exists(message) do
    UploadComment
    |> where(text_content: ^message.text_content)
    |> where(upload_id: ^message.upload_id)
    |> where(inserted_at: ^message.inserted_at)
    |> where(updated_at: ^message.updated_at)
    |> limit(1)
    |> select([uc], %{id: uc.id})
    |> Repo.one()
  end

  def run do
    Message
    |> where([m], m.type == "file_share")
    |> where([m], not is_nil(m.text_content))
    |> Stitch.ChunkStream.chunk_desc(1)
    |> Stream.each(fn
      [] ->
        nil

      [message] ->
        try do
          presence = StitchConnect.Web.UserStatusService.new()

          with {:upload, %Upload{} = upload} <-
                 {:upload, FileQueries.get_by_id(message.upload_id, preload_assoc: true)},
               {:exists, nil} <- {:exists, upload_comment_exists(message)},
               user = UserQueries.get_by_id(upload.user_id),
               {:created,
                {:ok,
                 %{
                   insert_file_comment_messages: inserted_messages_for_group,
                   upload_comment: upload_comment
                 }}} <-
                 {:created,
                  UploadComment.create(
                    upload,
                    user,
                    %{"text_content" => message.text_content},
                    presence,
                    %{silent: true}
                  )} do
            correct_timestamp(message, upload_comment, inserted_messages_for_group)
          else
            {:exists, upload_comment} ->
              Logger.warn("File comment already exists, (#{inspect(upload_comment.id)})")

            {:created, error} ->
              Logger.error("Error inserting file comment (#{inspect(error)})")

            error ->
              Logger.error("[#{inspect(__MODULE__)}] #{inspect(error)}")
          end
        rescue
          error ->
            Logger.error(
              "Error creating file comment for upload message (#{inspect(message)}): \n#{
                inspect(error)
              }"
            )

            :error
        end
    end)
    |> Stream.run()
  end

  # This is needed for the first file comment to appear right below the file share
  def correct_timestamp(file_share_message, file_comment, file_comment_messages) do
    file_comment
    |> change(updated_at: file_share_message.updated_at)
    |> change(inserted_at: file_share_message.inserted_at)
    |> Repo.update()

    Enum.each(file_comment_messages, fn %{message_creation_result: message_creation_result} ->
      message_creation_result.message
      |> change(updated_at: add_microsecond(file_share_message.updated_at))
      |> change(inserted_at: add_microsecond(file_share_message.inserted_at))
      |> Repo.update()
    end)
  end

  def add_microsecond(timestamp) do
    timestamp
    |> DateTime.from_naive!("Etc/UTC")
    |> Timex.shift(microseconds: 1)
    |> DateTime.to_naive()
  end

  # This is to make staging state closer to prod, by removign already created file comments.
  def clean_staging() do
    UploadComment
    |> Repo.delete_all()

    Upload
    |> Repo.update_all(set: [comment_count: 0])
  end
end

Stitch.Repo.Scripts.CreateFileCommentFromUpload.run()
