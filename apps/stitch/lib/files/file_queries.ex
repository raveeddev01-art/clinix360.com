defmodule Stitch.Files.FileQueries do
  import Ecto.Query

  alias Stitch.{
    Repo,
    Group,
    GroupUser,
    Files.Upload,
    Files.GroupUpload
  }

  @spec for_user(User.t(), map | nil) :: [Upload.t()]
  def for_user(user, options \\ %{}) do
    group_ids = GroupUser.group_ids(user.id)

    Upload
    |> join(:inner, [f], gu in GroupUpload, f.id == gu.upload_id)
    |> where([f, gu], gu.group_id in ^group_ids)
    |> group_by([f, gu], f.id)
    |> order_by([f, gu], desc: f.inserted_at)
    |> filter_by_filetype(options)
    |> filter_by_creator_id(options)
    |> select([f, gu], %Upload{
      id: f.id,
      filename: f.filename,
      mimetype: f.mimetype,
      filetype: f.filetype,
      size_in_bytes: f.size_in_bytes,
      shared_in: fragment("array_agg(?)", gu.group_id),
      user_id: f.user_id,
      updated_at: f.updated_at,
      inserted_at: f.inserted_at
    })
    |> Repo.all()
  end

  def filter_by_filetype(query, %{filetype: filetype}) do
    query
    |> where([f, fg], f.filetype == ^filetype)
  end

  def filter_by_filetype(query, _opts), do: query

  def filter_by_creator_id(query, %{creator_id: creator_id}) do
    query
    |> where([f, fg], f.user_id == ^creator_id)
  end

  def filter_by_creator_id(query, _opts), do: query

  @spec get_by_id(pos_integer, list) :: Upload.t() | nil
  def get_by_id(upload_id, opts \\ [])

  def get_by_id(upload_id, preload_assoc: true) do
    result =
      Upload
      |> where([f], f.id == ^upload_id)
      |> preload([:group_uploads])
      |> Repo.one()

    case result do
      %Upload{} = upload ->
        %{upload | shared_in: Enum.map(upload.group_uploads, & &1.group_id)}

      _ ->
        nil
    end
  end

  def get_by_id(upload_id, _opts) do
    Repo.get(Upload, upload_id)
  end

  @spec shared?(Upload.t(), Group.t()) :: boolean
  def shared?(%Upload{} = upload, %Group{} = group) do
    result =
      GroupUpload
      |> where(group_id: ^group.id)
      |> where(upload_id: ^upload.id)
      |> select([g], true)
      |> limit(1)
      |> Repo.one()

    !!result
  end
end
