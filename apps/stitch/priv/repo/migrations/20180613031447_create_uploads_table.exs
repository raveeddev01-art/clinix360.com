defmodule Stitch.Repo.Migrations.CreateUploadsTable do
  use Ecto.Migration

  def change do
    create table(:uploads) do
      add(:team_id, references(:teams, on_delete: :delete_all))
      add(:user_id, references(:users, on_delete: :delete_all))
      add(:filename, :string, null: false)
      add(:url, :string, null: false)
      add(:mimetype, :string, default: "application/octet-stream")
      add(:filetype, :string, default: "binary")
      add(:size_in_bytes, :integer, null: true)
      add(:preview_height, :integer, null: true)
      add(:preview_width, :integer, null: true)
      add(:preview_url, :string, null: true)

      timestamps()
    end
  end
end
