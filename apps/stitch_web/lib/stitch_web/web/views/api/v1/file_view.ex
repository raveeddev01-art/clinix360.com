defmodule Stitch.Web.Api.V1.FileView do
  use Stitch.Web, :view

  alias Stitch.{
    Files.Upload,
    Paginator,
    Web.Api.V1.FileCommentView,
    Web.UrlService
  }

  def render("index.json", %{files: %Paginator{data: data, meta: meta}}) do
    %{
      data: Enum.map(data, &file/1),
      meta: meta
    }
  end

  def render("show_with_comments.json", %{file: file}) do
    json = file(file)
    comments = FileCommentView.render("index.json", %{file_comments: file.upload_comments})
    Map.put(json, :comments, comments)
  end

  def render("show.json", %{file: file}), do: file(file)

  def file(file) do
    %{
      id: file.id,
      filename: file.filename,
      public: file.public,
      public_token: file.public_token,
      shared_in: file.shared_in,
      user_id: file.user_id,
      inserted_at: file.inserted_at,
      updated_at: file.updated_at,
      mimetype: file.mimetype,
      filetype: file.filetype,
      size_in_bytes: file.size_in_bytes,
      preview_url: preview_url(file),
      preview_height: file.preview_height,
      preview_width: file.preview_width,
      encoded_id: Upload.encode_url_id(file),
      url: UrlService.file_download_url(file),
      public_url: public_url(file),
      comment_count: file.comment_count
    }
  end

  def public_url(%Upload{public_token: token} = file) when not is_nil(token) do
    UrlService.public_download_page(file, token)
  end

  def public_url(_upload), do: nil

  def preview_url(file) do
    UrlService.file_preview_url(file)
  end
end
