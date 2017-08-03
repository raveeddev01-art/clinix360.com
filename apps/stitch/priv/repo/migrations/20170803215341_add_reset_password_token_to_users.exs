defmodule Stitch.Repo.Migrations.AddResetPasswordTokenToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :password_reset_token, :string 
    end
  end
end
