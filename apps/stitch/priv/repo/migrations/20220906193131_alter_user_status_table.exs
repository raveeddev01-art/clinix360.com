defmodule Stitch.Repo.Migrations.AlterUserStatusTable do
  use Ecto.Migration

  def change do
    drop table(:status)
    create table(:user_status) do
      add :user_id, references(:users, on_delete: :delete_all, null: false)
      add(:text, :string, null: false, default: "")
      add(:emoji, :string, null: false, default: "")
      add(:expiring_time, :utc_datetime, null: false)
      add(:active, :boolean, default: true, null: false)
      timestamps()
    end
  end
end
