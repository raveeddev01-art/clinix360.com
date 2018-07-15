defmodule Stitch.Repo.Scripts.CreateFileCommentFromUpload do
  @moduledoc """
  Creates file comment for each upload with text_content.

  sh> mix run apps/stitch/priv/repo/create_file_comment_from_upload_text_content.exs

  iex> Code.load_file("apps/stitch/priv/repo/create_file_comment_from_upload_text_content.exs")
  iex> Stitch.Repo.Scripts.CreateFileCommentFromUpload.run()

  Remove already existing comments from staging
  iex> Stitch.Repo.Scripts.CreateFileCommentFromUpload.clean_staging()
  """

  use Ecto.Migration

  import Ecto.Query
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

  def run do
    Repo.transaction(
      fn ->
        Message
        |> where([m], m.type == "file_share")
        |> where([m], not is_nil(m.text_content))
        |> Repo.stream()
        |> Stream.each(fn message ->
          try do
            # TODO: update with TX

            presence = StitchConnect.Web.UserStatusService.new()

            with {:upload, %Upload{} = upload} <-
                   {:upload, FileQueries.get_by_id(message.upload_id, preload_assoc: true)},
                 {:exists, nil} <-
                   {:exists,
                    Repo.get_by(
                      UploadComment,
                      text_content: message.text_content,
                      upload_id: message.upload_id,
                      inserted_at: upload.inserted_at,
                      updated_at: upload.updated_at
                    )},
                 user = UserQueries.get_by_id(upload.user_id),
                 # TODO: update response after TX implt.
                 {:created, {:ok, _, _}} <-
                   {:created,
                    UploadComment.create(
                      upload,
                      user,
                      %{"text_content" => message.text_content},
                      presence,
                      first_comment: true
                    )} do
              nil
            else
              {:exists, file_comment} ->
                Logger.warn("File comment already exists")

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
      end,
      timeout: :infinity
    )
  end

  def correct_timestamp(upload) do
    # get comment
    # get file_comment message
  end

  # This is to staging state closer to prod, by removign already created file comments.
  def clean_staging() do
    UploadComment
    |> Repo.delete_all()

    Upload
    |> Repo.update_all(set: [comment_count: 0])
  end
end

Stitch.Repo.Scripts.CreateFileCommentFromUpload.run()
