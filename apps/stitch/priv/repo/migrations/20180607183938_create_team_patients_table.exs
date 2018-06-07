defmodule Stitch.Repo.Migrations.CreateTeamPatientsTable do
  use Ecto.Migration

  def change do
    create table(:team_patients) do
      add(:team_id, references(:teams, on_delete: :delete_all))
      add(:patient_id, references(:patients, on_delete: :delete_all))

      add(:active, :boolean, default: false)
      add(:metadata, :map, default: %{})

      add(:mrn, :string, null: false)

      timestamps()
    end

    create(
      unique_index(
        :team_patients,
        [:patient_id, :team_id],
        name: :team_patients_patient_id_team_id_index
      )
    )

    create(unique_index(:team_patients, [:mrn, :team_id], name: :team_patients_mrn_team_id_index))
  end
end
