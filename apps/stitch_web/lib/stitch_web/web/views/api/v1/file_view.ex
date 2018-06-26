defmodule Stitch.Web.Api.V1.FileView do
  use Stitch.Web, :view

  alias Stitch.{
    Paginator
  }

  def render("index.json", %{files: %Paginator{data: data, meta: meta}}) do
    %{
      data: Enum.map(data, &file/1),
      meta: meta
    }
  end

  def render("show.json", %{file: file}), do: file(file)

  def file(file) do
    %{
      id: file.id,
      filename: file.filename,
      public: file.public,
      public_link: file.public_link,
      shared_in: file.shared_in,
      user_id: file.user_id,
      inserted_at: file.inserted_at,
      updated_at: file.updated_at,
      mimetype: file.mimetype,
      filetype: file.filetype,
      size_in_bytes: file.size_in_bytes,
      preview_url: preview_url(file),
      preview_height: file.preview_height,
      preview_width: file.preview_width
    }
  end

  def preview_url(file) do
    Stitch.Web.UrlService.file_preview_url(file)
    # preview_url = files_file_url(files_endpoint, :download_preview, encoded_file_id)
  end
end
