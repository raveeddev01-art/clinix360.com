defmodule Stitch.Repo.Migrations.AddResetPasswordTokenToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :reset_password_token, :string 
    end
  end
end
