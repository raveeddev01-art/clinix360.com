defmodule Stitch.Repo.Migrations.ModifyEmailTypeToCitext do
  use Ecto.Migration
  import Ecto.Query
  alias Stitch.Repo

  def up do
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

    flush()

    execute """
      UPDATE users SET email = lower(email)
    """

    flush()

    execute """
      UPDATE find_your_team_tokens SET email = lower(email)
    """

    flush()

    execute """
      CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;
    """

    flush()

    alter table("users") do
      modify :email, :citext, null: false
    end

    flush()

    alter table("find_your_team_tokens") do
      modify :email, :citext, null: false
    end
  end

  def down do
  end
end
