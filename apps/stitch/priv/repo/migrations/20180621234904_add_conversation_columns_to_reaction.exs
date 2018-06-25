defmodule Stitch.Repo.Migrations.AddConversationColumnsToReaction do
  use Ecto.Migration

  def change do
    alter table(:reactions) do
      add(:conversation_message_id, references(:conversation_messages, on_delete: :delete_all))
      add(:patient_id, references(:patients, on_delete: :delete_all))
    end

    create(unique_index(:reactions, [:emoji_name, :user_id, :conversation_message_id]))
    create(unique_index(:reactions, [:emoji_name, :patient_id, :conversation_message_id]))

    create(
      constraint(
        :reactions,
        :reactions_have_message_or_conversation_message,
        check:
          "(conversation_message_id IS NOT NULL)::integer + (message_id IS NOT NULL)::integer = 1"
      )
    )

    create(
      constraint(
        :reactions,
        :reactions_have_user_or_patient,
        check: "(user_id IS NOT NULL)::integer + (patient_id IS NOT NULL)::integer = 1"
      )
    )
  end
end
