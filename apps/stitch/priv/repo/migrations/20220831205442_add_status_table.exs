defmodule Stitch.Repo.Migrations.AddStatusTable do
  use Ecto.Migration

  def change do
    create table(:status) do
      # add :user_id, references(:users, on_delete: :delete_all),
      #     null: false
      add(:text, :string, null: false, default: "")
      add(:history, {:array, :string}, default: [], null: false)
      add(:emoji, :string, null: false, default: "")
      add(:time, :utc_datetime, null: true)
      # timestamps()
    end

  end
end
