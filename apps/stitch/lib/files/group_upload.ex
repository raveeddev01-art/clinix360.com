defmodule Stitch.Files.GroupUpload do
  alias Stitch.{
    Files.Upload,
    Group,
    Repo,
    Files.GroupUpload
  }

  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query

  @type t :: %__MODULE__{}

  schema "group_uploads" do
    belongs_to(:upload, Upload)
    belongs_to(:group, Group)
    timestamps(updated_at: false)
  end

  def new(%GroupUpload{} = group_file \\ %GroupUpload{}) do
    group_file
    |> cast(%{}, [])
    |> unique_constraint(
      :upload_id,
      name: :group_uploads_group_id_upload_id_index,
      message: "The file is already shared in this group"
    )
  end

  @spec create(Group.t(), Upload.t()) :: {:ok, GroupUpload.t()} | {:error, Ecto.Changeset.t()}
  def create(%Group{} = group, %Upload{} = upload) do
    %GroupUpload{group_id: group.id, upload_id: upload.id}
    |> new()
    |> Repo.insert()
  end

  @spec delete(Group.t(), Upload.t()) :: {:ok, GroupUpload.t()} | {:error, binary}
  def delete(%Group{} = group, %Upload{} = upload) do
    result =
      GroupUpload
      |> where(group_id: ^group.id)
      |> where(upload_id: ^upload.id)
      |> Repo.delete_all(returning: true)

    case result do
      {1, [group_upload]} ->
        {:ok, group_upload}

      {0, _} ->
        {:error, "not found"}

      error ->
        {:error, inspect(error)}
    end
  end
end
