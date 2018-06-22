defmodule Stitch.Files.UploadComment do
  alias Stitch.{
    Accounts.User,
    Files.Upload,
    Files.GroupUpload,
    Files.Thumb,
    Files.UploadComment,
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

  @spec create(Upload.t(), User.t(), map) ::
          {:ok, UploadComment.t()} | {:error, Ecto.Changeset.t()}
  def create(%Upload{} = upload, %User{} = user, attrs) do
    attrs = Map.merge(attrs, %{"fields" => Upload.fields(upload)}) |> IO.inspect()

    %UploadComment{user_id: user.id, upload_id: upload.id}
    |> new(attrs)
    |> Repo.insert()
  end

  @spec update(UploadComment.t(), String.t()) ::
          {:ok, UploadComment.t()} | {:error, Ecto.Changeset.t()}
  def update(%UploadComment{} = upload_comment, text_content) do
    upload_comment
    |> change(text_content: text_content)
    |> Repo.update()
  end

  @spec delete(UploadComment.t()) :: {:ok, UploadComment.t()} | {:error, Ecto.Changeset.t()}
  def delete(%UploadComment{} = upload_comment) do
    upload_comment
    |> Repo.delete()
  end

  @spec get(pos_integer) :: UploadComment.t() | nil
  def get(id), do: Repo.get(UploadComment, id)
end
