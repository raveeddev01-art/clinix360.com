defmodule Stitch.Web.Api.V1.FileView do
  use Stitch.Web, :view

  def render("index.json", %{files: files}) do
    Enum.map(files, &file/1)
  end

  def render("show.json", %{file: file}), do: file(file)

  def file(file) do
    %{
      id: file.id,
      filename: file.filename,
      public: file.public,
      shared_in: file.shared_in,
      user_id: file.user_id,
      inserted_at: file.inserted_at,
      updated_at: file.updated_at,
      mimetype: file.mimetype,
      filetype: file.filetype
    }
  end
end
