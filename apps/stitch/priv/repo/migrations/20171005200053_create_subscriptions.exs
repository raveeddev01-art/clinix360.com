defmodule Stitch.Repo.Migrations.CreateSubscriptions do
  use Ecto.Migration

  def change do
    create table(:subscriptions) do
      add :valid_until, :utc_datetime
      add :tier, :string
      add :customer_id, :string
      add :subscription_id, :string
      add :renewal_frequency, :string
      add :renews, :boolean

      add :team_id, references(:teams, on_delete: :delete_all)

      timestamps()
    end
    create unique_index(:subscriptions, :team_id)
  end
end
