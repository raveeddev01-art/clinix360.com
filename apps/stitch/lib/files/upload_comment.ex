defmodule Stitch.Files.UploadComment do
  alias Stitch.{
    Accounts.User,
    Audit,
    Files.Upload,
    Files.UploadComment,
    GroupQueries,
    Message,
    Message.MessageCreation,
    Repo
  }

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

  @spec create(Upload.t(), User.t(), map, map) ::
          {:ok, UploadComment.t(), list} | {:error, Ecto.Changeset.t()}
  def create(%Upload{} = upload, %User{} = user, attrs, presence) do
    attrs = Map.merge(attrs, %{"fields" => Upload.fields(upload)})

    %UploadComment{user_id: user.id, upload_id: upload.id}
    |> new(attrs)
    |> Repo.insert()
    |> increment_comment_counter()
    |> insert_file_comment_messages(upload, user, presence, attrs)
  end

  @spec update(UploadComment.t(), String.t(), User.t()) ::
          {:ok, UploadComment.t()} | {:error, Ecto.Changeset.t()}
  def update(%UploadComment{} = upload_comment, text_content, author) do
    upload_comment
    |> change(text_content: text_content)
    |> Repo.update()
    |> update_file_comment_message()
    |> Audit.UploadComment.track_update(author, upload_comment)
  end

  @spec delete(UploadComment.t(), User.t()) ::
          {:ok, UploadComment.t()} | {:error, Ecto.Changeset.t()}
  def delete(%UploadComment{} = upload_comment, author) do
    message_file_comment_ids = Message.file_comment_ids(upload_comment)

    upload_comment
    |> Repo.delete()
    |> Audit.UploadComment.track_delete(author)
    |> decrement_comment_counter()
    |> delete_file_comment_messages(message_file_comment_ids)
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

  defp insert_file_comment_messages({:ok, upload_comment}, upload, user, presence, attrs) do
    groups = GroupQueries.groups_for_comment(upload.shared_in, user)

    result =
      Enum.map(groups, fn group ->
        attrs = %{
          "type" => "file_comment",
          "upload_id" => upload_comment.upload_id,
          "text_content" => attrs["text_content"]
        }

        result = MessageCreation.create(group, user, attrs, presence, upload, upload_comment)

        %{group: group, result: result}
      end)

    {:ok, upload_comment, result}
  end

  defp insert_file_comment_messages(result, _upload, _user, _presence, _attrs), do: result

  def update_file_comment_message({:ok, upload_comment}) do
    {_, updated_messages} = Message.update_file_comments(upload_comment)
    {:ok, upload_comment, updated_messages}
  end

  def update_file_comment_message(result), do: result

  def delete_file_comment_messages({:ok, upload_comment}, message_file_comment_ids) do
    {:ok, upload_comment, message_file_comment_ids}
  end

  def delete_file_comment_messages(result), do: result
end
