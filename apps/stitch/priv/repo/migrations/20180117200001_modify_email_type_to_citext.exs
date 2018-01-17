defmodule Stitch.Repo.Migrations.ModifyEmailTypeToCitext do
  use Ecto.Migration

  def change do
    execute "CREATE EXTENSION citext", "DROP EXTENSION citext"

    alter table("users") do
      modify :email, :citext
    end

    alter table("find_your_team_tokens") do
      modify :email, :citext
    end
  end
end
