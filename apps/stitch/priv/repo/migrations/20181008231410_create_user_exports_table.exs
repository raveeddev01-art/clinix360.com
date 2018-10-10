defmodule Stitch.Repo.Migrations.AddUserExportsTable do
  use Ecto.Migration

  def change do
    create table(:user_exports) do
      add(:status, :string)
      add(:zip_url, :string)
      add(:team_id, references(:teams, on_delete: :delete_all))
      add(:user_id, references(:users, on_delete: :nothing))
      timestamps()
    end

    create(index(:user_exports, :team_id))
  end
end
