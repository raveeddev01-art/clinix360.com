defmodule Stitch.Repo.Migrations.CreatePatientsTable do
  use Ecto.Migration

  def change do
    create table(:patients) do
      add(:first_name, :string, null: false)
      add(:last_name, :string, null: false)
      add(:email, :citext, null: false)

      add(:avatar, :string)
      add(:avatar_thumb, :string)
      add(:phone_number, :string)
      add(:onboarded, :boolean, default: false)

      timestamps()
    end

    create(unique_index(:patients, [:email]))
  end
end
