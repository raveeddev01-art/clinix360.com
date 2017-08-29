defmodule Stitch.Repo.Migrations.UpdateMentioningMessageIds do
  use Ecto.Migration

  def up do
    alter table(:group_users) do
      remove :mentioning_message_ids
      add :mentioning_message_ids, {:array, :integer}, default: []
    end
  end

  def down do
    alter table(:group_users) do
      remove :mentioning_message_ids
      add :mentioning_message_ids, :map, default: "{}", null: false
    end
  end
end

