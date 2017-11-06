defmodule Stitch.Repo.Migrations.CreatePaymentMethods do
  use Ecto.Migration

  def change do
    create table(:payment_methods) do
      add :card_id, :string
      add :brand, :string
      add :last_four, :string
      add :exp_month, :integer
      add :exp_year, :integer
      add :default, :boolean, default: false

      add :team_id, references(:teams, on_delete: :delete_all)

      timestamps()
    end

    create index(:payment_methods, :team_id)
  end
end
