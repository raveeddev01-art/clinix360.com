defmodule Stitch.Repo.Migrations.SetDefaultGroupForTheExistingTeams do
  use Ecto.Migration

  @disable_ddl_transaction true

  import Ecto.Query
  import Ecto.Changeset

  alias Stitch.{Repo, Group, Team}

  def up do
    Team
    |> Repo.all
    |> Enum.each(fn team ->
      Group
      |> where(team_id: ^team.id)
      |> order_by([g], asc: g.inserted_at)
      |> limit(1)
      |> Repo.one
      |> change(is_default: true)
      |> Repo.update!
    end)
  end

  def down do
  end
end

