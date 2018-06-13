defmodule Stitch.Repo.Migrations.CreateConversationPatientsTable do
  use Ecto.Migration

  def change do
    create table(:conversation_patients) do
      add(:conversation_id, references(:conversations, on_delete: :delete_all))
      add(:team_patient_id, references(:team_patients, on_delete: :delete_all))

      timestamps()
    end

    create(
      unique_index(
        :conversation_patients,
        [:conversation_id, :team_patient_id],
        name: :conversation_patients_conversation_id_team_patient_id_index
      )
    )
  end
end
