defmodule Stitch.Repo.Migrations.ConvertFilenameTypeFromStringToText do
  use Ecto.Migration

  def up do
    alter table(:uploads) do
      modify(:filename, :text, null: false)
      modify(:url, :text, null: false)
      modify(:mimetype, :text, default: "application/octet-stream")
      modify(:filetype, :text, default: "binary")
    end
  end

  def down do
    alter table(:uploads) do
      modify(:filename, :string, null: false)
      modify(:url, :string, null: false)
      modify(:mimetype, :string, default: "application/octet-stream")
      modify(:filetype, :string, default: "binary")
    end
  end
end
