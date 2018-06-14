defmodule Stitch.Repo.Migrations.CreateInboxesTable do
  use Ecto.Migration

  def change do
    create table(:inboxes) do
      add(:team_id, references(:teams, on_delete: :delete_all))

      add(:name, :string, null: false)
      add(:is_default, :boolean, null: false)

      timestamps()
    end

    create(unique_index(:inboxes, [:name, :team_id], name: :name_team_id_index))

    create(
      unique_index(
        :inboxes,
        :team_id,
        where: "is_default = TRUE",
        name: :default_inbox_team_id_index
      )
    )
  end
end
