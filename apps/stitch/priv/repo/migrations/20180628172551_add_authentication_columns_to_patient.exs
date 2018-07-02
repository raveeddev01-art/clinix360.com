defmodule Stitch.Repo.Migrations.AddAuthenticationColumnsToPatient do
  use Ecto.Migration

  def change do
    alter table(:patients) do
      add(:token, :string)
      add(:confirmation_code, :string)
      add(:email_confirmed, :boolean, default: false)
      add(:password_hash, :string)
    end

    create(unique_index(:patients, [:token]))
  end
end
