defmodule Stitch.Files.UploadComment do
  alias Stitch.{
    Accounts.User,
    Audit,
    Files.Upload,
    Files.UploadComment,
    Files.FileService,
    GroupQueries,
    Message,
    Message.MessageCreation,
    Repo
  }

  alias Ecto.Multi

  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{}

  schema "upload_comments" do
    belongs_to(:user, User)
    belongs_to(:upload, Upload)
    field(:text_content, :string)
    field(:fields, :map)
    timestamps()
  end

  @castable_attributes [
    :text_content,
    :fields
  ]

  @spec new(UploadComment.t(), map) :: Ecto.Changeset.t()
  def new(%UploadComment{} = struct, attrs) do
    struct
    |> cast(attrs, @castable_attributes)
    |> validate_required([:text_content])
  end

  @spec edit_changeset(UploadComment.t(), map) :: Ecto.Changeset.t()
  def edit_changeset(%UploadComment{} = struct, attrs) do
    struct
    |> cast(attrs, [:text_content])
    |> validate_required([:text_content])
  end

  @spec create(Upload.t(), User.t(), map, map) ::
          {:ok, UploadComment.t(), list} | {:error, Ecto.Changeset.t()}
  def create(%Upload{} = upload, %User{} = user, attrs, presence) do
    attrs = Map.merge(attrs, %{"fields" => Upload.fields(upload)})

    uplooad_comment_changeset =
      %UploadComment{user_id: user.id, upload_id: upload.id} |> new(attrs)

    Multi.new()
    |> Multi.insert(:upload_comment, uplooad_comment_changeset)
    |> Upload.multi_update_comment_counter(upload.id, 1)
    |> Multi.run(:insert_file_comment_messages, fn %{upload_comment: upload_comment} ->
      {:ok, insert_file_comment_messages(upload_comment, upload, user, presence, attrs)}
    end)
    |> Repo.transaction()
  end

  @spec update(UploadComment.t(), String.t(), User.t()) ::
          {:ok, UploadComment.t()} | {:error, Ecto.Changeset.t()}
  def update(%UploadComment{} = upload_comment, text_content, author) do
    uplooad_comment_changeset =
      upload_comment
      |> edit_changeset(%{"text_content" => text_content})

    Multi.new()
    |> Multi.update(:update_upload_comment, uplooad_comment_changeset)
    |> Multi.update_all(
      :update_file_comment_messages,
      FileService.update_file_comment_messages(upload_comment.id, text_content),
      [],
      returning: true
    )
    |> Repo.transaction()
    |> Audit.UploadComment.track_update(author, upload_comment)
  end

  @spec delete(UploadComment.t(), User.t()) ::
          {:ok, UploadComment.t()} | {:error, Ecto.Changeset.t()}
  def delete(%UploadComment{} = upload_comment, author) do
    Multi.new()
    |> Multi.delete(:delete_upload_comment, upload_comment)
    |> Upload.multi_update_comment_counter(upload_comment.upload_id, -1)
    |> Repo.transaction()
    |> Audit.UploadComment.track_delete(author)
  end

  @spec get(pos_integer) :: UploadComment.t() | nil
  def get(id), do: Repo.get(UploadComment, id)

  defp increment_comment_counter({:ok, upload_comment} = result) do
    Upload.increment_comment_counter(upload_comment.upload_id)
    result
  end

  defp increment_comment_counter(result), do: result

  defp decrement_comment_counter({:ok, upload_comment} = result) do
    Upload.decrement_comment_counter(upload_comment.upload_id)
    result
  end

  defp decrement_comment_counter(result), do: result

  defp insert_file_comment_messages(upload_comment, upload, user, presence, attrs) do
    groups = GroupQueries.groups_for_file_comment(upload, user)

    Enum.reduce(groups, [], fn group, acc ->
      attrs = %{
        "type" => "file_comment",
        "upload_id" => upload_comment.upload_id,
        "text_content" => attrs["text_content"]
      }

      result = MessageCreation.create(group, user, attrs, presence, upload, upload_comment)

      case result do
        {:ok, message_creation_result} ->
          [%{group: group, message_creation_result: message_creation_result} | acc]

        _ ->
          acc
      end
    end)
  end

  def update_file_comment_message(result), do: result

  def delete_file_comment_messages({:ok, upload_comment}, message_file_comment_ids) do
    {:ok, upload_comment, message_file_comment_ids}
  end

  def delete_file_comment_messages(result), do: result
end
