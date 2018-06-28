defmodule Stitch.Files.UploadComment do
  alias Stitch.{
    Accounts.User,
    Files.Upload,
    Files.GroupUpload,
    Files.Thumb,
    Files.UploadComment,
    GroupQueries,
    Message.MessageCreation,
    Rand,
    Repo,
    Team,
    Group
  }

  use Ecto.Schema
  import Ecto.Query
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

    # TODO: presence
    %UploadComment{user_id: user.id, upload_id: upload.id}
    |> new(attrs)
    |> Repo.insert()
    |> increment_comment_counter()
    |> insert_file_comment_messages(upload, user, presence)
  end

  @spec update(UploadComment.t(), String.t()) ::
          {:ok, UploadComment.t()} | {:error, Ecto.Changeset.t()}
  def update(%UploadComment{} = upload_comment, text_content) do
    # TODO: update file comments
    upload_comment
    |> change(text_content: text_content)
    |> Repo.update()
  end

  @spec delete(UploadComment.t()) :: {:ok, UploadComment.t()} | {:error, Ecto.Changeset.t()}
  def delete(%UploadComment{} = upload_comment) do
    # TODO: delete file comments

    upload_comment
    |> Repo.delete()
    |> decrement_comment_counter()
  end

  @spec get(pos_integer) :: UploadComment.t() | nil
  def get(id), do: Repo.get(UploadComment, id)

  defp increment_comment_counter({:ok, upload_comment} = result) do
    Upload.increment_comment_counter(upload_comment.upload_id)
    result
  end

  defp increment_comment_counter(result, _presence), do: result

  defp decrement_comment_counter({:ok, upload_comment} = result) do
    Upload.decrement_comment_counter(upload_comment.upload_id)
    result
  end

  defp decrement_comment_counter(result), do: result

  defp insert_file_comment_messages({:ok, upload_comment} = result, upload, user, presence) do
    groups = GroupQueries.select_non_dm_groups(upload.shared_in)

    result =
      Enum.map(groups, fn group ->
        attrs = %{
          "type" => "file_comment",
          "upload_id" => upload_comment.upload_id,
          "text_content" => upload_comment.text_content
        }

        result = MessageCreation.create(group, user, attrs, presence) |> IO.inspect()
        %{group: group, result: result}
      end)

    {:ok, upload_comment, result}
  end

  defp insert_file_comment_messages(result, _upload, _user, _presence), do: result
end
