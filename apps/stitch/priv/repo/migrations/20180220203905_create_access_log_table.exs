defmodule Stitch.Repo.Migrations.CreateAccessLogTable do
  use Ecto.Migration

  def change do
    create table(:access_logs) do
      add(:user_id, references(:users, on_delete: :delete_all))

      add(:user_agent, :string, null: false)
      add(:ip_address, :string, null: false)
      add(:app_version, :string, null: false)

      add(:last_access_at, :naive_datetime, null: false)
      add(:access_count, :integer, null: false, default: 1)

      add(:inserted_at_date, :naive_datetime, null: false)

      timestamps(updated_at: false)
    end

    # NOTE: `inserted_at_date` is used instead of `date_trunc('day', inserted_at)` because Ecto
    # currently doesn't support partial unique index in upsert (see https://github.com/elixir-ecto/ecto/issues/2081).
    # Also note, we use `naive_datetime` instead of `date` in order to be consistent with `naive_datetime` used for `inserted_at`
    create(
      unique_index(:access_logs, [
        :user_id,
        :user_agent,
        :ip_address,
        :app_version,
        :inserted_at_date
      ])
    )
  end
end