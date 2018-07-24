defmodule Stitch.Repo.Migrations.AddUploadIdToMessageActions do
  use Ecto.Migration

  def up do
    drop(unique_index(:message_actions, [:user_id, :message_id, :category]))

    alter table(:message_actions) do
      add(:upload_id, references(:uploads, on_delete: :delete_all))
    end

    create(unique_index(:message_actions, [:user_id, :upload_id, :message_id, :category]))

    create(
      constraint(
        :message_actions,
        :message_actoins_have_message_or_upload,
        check: "(upload_id IS NOT NULL)::integer + (message_id IS NOT NULL)::integer = 1"
      )
    )
  end

  def down do
    drop(
      constraint(
        :message_actions,
        :message_actoins_have_message_or_upload,
        check: "(upload_id IS NOT NULL)::integer + (message_id IS NOT NULL)::integer = 1"
      )
    )

    drop(unique_index(:message_actions, [:user_id, :upload_id, :message_id, :category]))

    alter table(:message_actions) do
      remove(:upload_id)
    end

    create(unique_index(:message_actions, [:user_id, :message_id, :category]))
  end
end
