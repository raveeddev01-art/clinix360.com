defmodule Stitch.Repo.Migrations.AddPaymentHistoryTable do
  use Ecto.Migration

  def change do
    create table(:payment_history) do
      add(:invoice_id, :string, unique: true)
      add(:team_id, references(:teams, on_delete: :delete_all))
      add(:plan, :string)
      add(:amount, :decimal)
      add(:quantity, :integer)
      add(:period_start, :naive_datetime)
      add(:period_end, :naive_datetime)

      # History cannot be updated
      timestamps(updated_at: false)
    end

    create(index(:payment_history, :invoice_id, unique: true))
  end
end
