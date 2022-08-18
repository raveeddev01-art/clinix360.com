defmodule Stitch.Repo.Migrations.CreateSignupCoupons do
  use Ecto.Migration

  def change do
    create table(:signup_coupons) do
      add :code, :string
      add :is_used, :boolean, default: false, null: false
      add :platform, :string
      add :team_id, :integer
      add :user_id, :integer

      timestamps()
    end

  end
end
