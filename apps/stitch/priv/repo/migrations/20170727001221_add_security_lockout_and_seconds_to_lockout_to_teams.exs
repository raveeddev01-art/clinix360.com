defmodule Stitch.Repo.Migrations.AddSecurityLockoutAndSecondsToLockoutToTeams do
  use Ecto.Migration

  def change do
    alter table(:teams) do
      add :security_lockout, :boolean, default: false
      add :seconds_to_lockout, :integer
    end
  end
end
