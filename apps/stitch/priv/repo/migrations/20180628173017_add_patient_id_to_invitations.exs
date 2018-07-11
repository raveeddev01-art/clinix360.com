defmodule Stitch.Repo.Migrations.AddPatientIdToInvitations do
  use Ecto.Migration

  def change do
    alter table(:invitations) do
      add(:patient_id, references(:patients, on_delete: :delete_all))
    end

    create(
      constraint(
        :invitations,
        :invitations_have_user_or_patient,
        check: "(user_id IS NOT NULL)::integer + (patient_id IS NOT NULL)::integer = 1"
      )
    )
  end
end
