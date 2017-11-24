defmodule Stitch.Repo.Migrations.AddProfileImageThumb do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :profile_image_thumb_url, :string, default: false, null: true
    end
  end
end
