defmodule Stitch.Repo.Migrations.AddPatientIdToPasswordResetTokens do
  use Ecto.Migration

  def change do
    alter table(:password_reset_tokens) do
      add(:patient_id, references(:patients, on_delete: :delete_all))
    end

    create(
      constraint(
        :password_reset_tokens,
        :password_reset_tokens_have_user_or_patient,
        check: "(user_id IS NOT NULL)::integer + (patient_id IS NOT NULL)::integer = 1"
      )
    )
  end
end
