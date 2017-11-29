defmodule Stitch.Repo.Migrations.AddTrialValidUntilToSubscriptions do
  use Ecto.Migration

  def up do
    alter table(:subscriptions) do
      add :trial_valid_until, :utc_datetime
    end

    # Ensures all records have a valid trial date end time that would have lasted 14 days
    execute """
    UPDATE subscriptions
    SET trial_valid_until = (inserted_at + INTERVAL '14 days');
    """
  end

  def down do
    alter table(:subscriptions) do
      remove :trial_valid_until
    end
  end
end
