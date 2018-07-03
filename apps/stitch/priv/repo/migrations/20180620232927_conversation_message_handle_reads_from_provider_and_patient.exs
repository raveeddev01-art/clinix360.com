defmodule Stitch.Repo.Migrations.ConversationMessageHandleReadsFromProviderAndPatient do
  use Ecto.Migration

  def change do
    rename(table(:conversation_messages), :read_status, to: :provider_read_status)

    alter table(:conversation_messages) do
      add(:patient_read_status, :map, default: "{}")
    end
  end
end
