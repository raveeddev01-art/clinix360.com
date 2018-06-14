defmodule Stitch.Web.Api.V1.FileView do
  use Stitch.Web, :view

  def render("index.json", %{files: files}) do
    Enum.map(files, &file/1)
  end

  def render("show.json", %{file: file}), do: file(file)

  defp file(file) do
    %{
      id: file.id,
      filename: file.filename,
      shared_in: file.shared_in,
      user_id: file.user_id,
      inserted_at: file.inserted_at,
      updated_at: file.updated_at,
      mimetype: file.mimetype,
      filetype: file.filetype
    }
  end
end
