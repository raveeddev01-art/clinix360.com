defmodule Stitch.Files.FileQueries do
  import Ecto.Query

  alias Stitch.{
    Repo,
    Group,
    GroupUser,
    Files.Upload,
    Files.GroupUpload,
    Files.FileTypes,
    Paginator
  }

  @spec for_user(User.t(), map | nil) :: [Upload.t()]
  def for_user(user, options \\ %{}) do
    group_ids = GroupUser.group_ids(user.id)
    limit = options[:limit] || 30
    offset = options[:skip] || 0

    Upload
    |> join(:inner, [f], gu in GroupUpload, f.id == gu.upload_id)
    |> where([f, gu], gu.group_id in ^group_ids)
    |> group_by([f, gu], f.id)
    |> order_by([f, gu], desc: f.inserted_at)
    |> filter_by_filetype(options)
    |> filter_by_creator_id(options)
    |> filter_by_filename(options)
    |> select([f, gu], %Upload{
      id: f.id,
      filename: f.filename,
      mimetype: f.mimetype,
      filetype: f.filetype,
      size_in_bytes: f.size_in_bytes,
      shared_in: fragment("array_agg(?)", gu.group_id),
      user_id: f.user_id,
      updated_at: f.updated_at,
      inserted_at: f.inserted_at,
      preview_url: f.preview_url,
      preview_height: f.preview_height,
      preview_width: f.preview_width
    })
    |> Paginator.new(limit: limit, skip: offset)

    # |> Repo.all()
  end

  def filter_by_filetype(query, %{filetype: "all"}), do: query

  def filter_by_filetype(query, %{filetype: "images"}),
    do: where(query, [f, fg], f.filetype in ^FileTypes.images())

  def filter_by_filetype(query, %{filetype: "pdfs"}),
    do: where(query, [f, fg], f.filetype == ^"pdf")

  def filter_by_filetype(query, %{filetype: "videos"}),
    do: where(query, [f, fg], f.filetype in ^FileTypes.videos())

  def filter_by_filetype(query, %{filetype: "audio"}),
    do: where(query, [f, fg], f.filetype in ^FileTypes.audio())

  def filter_by_filetype(query, %{filetype: "archive"}),
    do: where(query, [f, fg], f.filetype in ^FileTypes.archive())

  def filter_by_filetype(query, %{filetype: "text"}),
    do: where(query, [f, fg], f.filetype in ^FileTypes.text())

  def filter_by_filetype(query, %{filetype: filetype}),
    do: where(query, [f, fg], f.filetype == ^filetype)

  def filter_by_filetype(query, _opts), do: query

  def filter_by_creator_id(query, %{creator_id: creator_id}) do
    query
    |> where([f, fg], f.user_id == ^creator_id)
  end

  def filter_by_creator_id(query, _opts), do: query

  def filter_by_filename(query, %{filename: filename}) do
    query
    |> where([f, fg], ilike(f.filename, ^"%#{filename}%"))
  end

  def filter_by_filename(query, _opts), do: query

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
end
