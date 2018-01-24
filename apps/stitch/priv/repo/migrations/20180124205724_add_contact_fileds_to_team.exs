defmodule Stitch.Repo.Migrations.AddContactFiledsToTeam do
  use Ecto.Migration

  def change do
    alter table(:teams) do
      add(:company_names, :string)
      add(:address_line_one, :string)
      add(:address_line_two, :string)
      add(:city, :string)
      add(:state, :string)
      add(:country, :string)
      add(:zip_code, :string)
    end
  end
end
