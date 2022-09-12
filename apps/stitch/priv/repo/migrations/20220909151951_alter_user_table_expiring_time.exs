defmodule Stitch.Repo.Migrations.AlterUserTableExpiringTime do
  use Ecto.Migration

  def change do
    alter table(:user_status) do
      modify(:expiring_time, :utc_datetime, default: "3022-09-08T00:00:00.023000Z", null: false)
    end
  end
end
