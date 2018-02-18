defmodule Stitch.Repo.Migrations.RemovePasswordResetTokenFromUsers do
  use Ecto.Migration

  def up do
    alter table(:users) do
      remove :password_reset_token
    end
  end

  def down do
    alter table(:users) do
      add :password_reset_token, :string
    end
  end
end
