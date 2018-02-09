defmodule Stitch.Repo.Migrations.CreatePasswordResetTokens do
  use Ecto.Migration

  def change do
    create table(:password_reset_tokens) do
      add :user_id, references(:users, on_delete: :delete_all)
      add :activated_at, :naive_datetime, null: true
      add :valid, :boolean, default: true
      add :token, :string, null: false

      timestamps updated_at: false
    end

    create unique_index(:password_reset_tokens, [:token])
  end
end
