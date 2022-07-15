defmodule Stitch.Repo.Migrations.AddNotifyUserIdsInMessage do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add(:notify_user_ids, {:array, :integer}, default: [])
    end
  end
end
