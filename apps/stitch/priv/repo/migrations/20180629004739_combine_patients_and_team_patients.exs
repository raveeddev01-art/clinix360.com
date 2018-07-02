defmodule Stitch.Repo.Migrations.CombinePatientsAndTeamPatients do
  use Ecto.Migration

  def change do
    # DROP CONSTRAINTS ON RELATED TABLES

    drop(
      constraint(
        :conversation_messages,
        :conversation_messages_have_provider_or_patient
      )
    )

    drop(
      constraint(
        :conversation_patients,
        :conversation_patients_team_patient_id_fkey
      )
    )

    drop(
      constraint(
        :conversation_messages,
        :conversation_messages_team_patient_id_fkey
      )
    )

    # DROP TEAM PATIENTS TABLE
    drop(table(:team_patients))

    # MOVE TEAM PATIENTS COLUMNS INTO PATIENTS
    # AND ADD TEAM_ID FOR BELONGS_TO
    alter table(:patients) do
      add(:team_id, references(:teams, on_delete: :delete_all))
      add(:disabled, :boolean, default: false)
      add(:mrn, :string, null: false)
    end

    # REPLACE MESSAGES AND PATIENTS LINKS TO TEAM_PATIENT WITH PATIENT
    alter table(:conversation_messages) do
      remove(:team_patient_id)
      add(:patient_id, references(:patients, on_delete: :delete_all))
    end

    alter table(:conversation_patients) do
      remove(:team_patient_id)
      add(:patient_id, references(:patients, on_delete: :delete_all))
    end

    # ADD NEW INDICES FOR PATIENTS

    create(unique_index(:patients, [:mrn, :team_id], name: :patients_mrn_team_id_index))
    create(unique_index(:patients, [:email, :team_id], name: :patients_email_team_id_index))

    create(
      unique_index(
        :conversation_patients,
        [:conversation_id, :patient_id],
        name: :conversation_patients_conversation_id_patient_id_index
      )
    )

    # RECREATE PREVIOUSLY DROPPED CONSTRAINT

    create(
      constraint(
        :conversation_messages,
        :conversation_messages_have_provider_or_patient,
        check: "(patient_id IS NOT NULL)::integer + (provider_id IS NOT NULL)::integer = 1"
      )
    )
  end
end
