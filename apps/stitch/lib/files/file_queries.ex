defmodule Stitch.Files.FileQueries do
  import Ecto.Query

  alias Stitch.{
    Repo,
    GroupUser,
    Files.Upload,
    Files.GroupUpload
  }

  @spec for_user(User.t(), map | nil) :: [Upload.t()]
  def for_user(user, options \\ %{}) do
    group_ids = GroupUser.group_ids(user.id)

    Upload
    |> join(:inner, [f], fg in GroupUpload, f.id == fg.file_id)
    |> where([f, fg], fg.group_id in ^group_ids)
    |> group_by([f, fg], f.id)
    |> order_by([f, fg], desc: f.inserted_at)
    |> filter_by_filetype(options)
    |> filter_by_creator_id(options)
    |> select([f, fg], %Upload{
      id: f.id,
      filename: f.filename,
      mimetype: f.mimetype,
      filetype: f.filetype,
      size_in_bytes: f.size_in_bytes,
      shared_in: fragment("array_agg(?)", fg.group_id),
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
end
