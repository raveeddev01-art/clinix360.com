defmodule Stitch.Repo.Migrations.ModifyEmailTypeToCitext do
  use Ecto.Migration
  import Ecto.Query
  alias Stitch.Repo

  def change do
    emails =
      from(
        u in "users",
        select: fragment("lower(?)", u.email),
        where: is_nil(u.team_id),
        group_by: fragment("lower(?)", u.email),
        having: count(u.id) > 1
      )
      |> Repo.all()

    from(u in "users", where: fragment("lower(?)", u.email) in ^emails, where: is_nil(u.team_id))
    |> Repo.delete_all()

    emails =
      from(
        t in "find_your_team_tokens",
        select: fragment("lower(?)", t.email),
        group_by: fragment("lower(?)", t.email),
        having: count(t.id) > 1
      )
      |> Repo.all()

    from(t in "find_your_team_tokens", where: fragment("lower(?)", t.email) in ^emails)
    |> Repo.delete_all()

    execute("CREATE EXTENSION citext", "DROP EXTENSION citext")

    alter table("users") do
      modify(:email, :citext)
    end

    alter table("find_your_team_tokens") do
      modify(:email, :citext)
    end
  end
end
