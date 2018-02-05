defmodule Stitch.MeteorMigration.DBStat do
  alias Stitch.Accounts.User
  alias Stitch.TeamQueries
  alias Stitch.{Repo, Group, Message}
  import Ecto.Query

  def team_stat(team_slug) do
    roles = [
      "multi-room-guest",
      "single-room-guest",
      "admin",
      "member",
    ]

    team = Stitch.TeamQueries.get_by_slug(team_slug)

    group_ids =
      Group
      |> where([g], g.team_id == ^team.id)
      |> select([g], g.id)
      |> Repo.all


    single_dms =
      Group
      |> where([g], g.team_id == ^team.id)
      |> where([g], g.name == "__dm_group__")
      |> select([g], g.id)
      |> Repo.all


    multi_dms =
      Group
      |> where([g], g.team_id == ^team.id)
      |> where([g], g.name == "__multi_dm_group__")
      |> select([g], g.id)
      |> Repo.all

    IO.puts "Migrated Messages (total): #{count_migrated_messages(group_ids)}"

    IO.puts "Team: #{team.name} #{team.slug}"

    roles |> Enum.each(fn role ->
      count =
        User
        |> where([u], ^role in u.roles)
        |> where([u], u.team_id == ^team.id)
        |> select([u], count(u.id))
        |> Repo.one
      IO.puts "Users #{role}: #{count}"
    end)

    IO.puts "Groups: #{length(group_ids)}"
    IO.puts "Signle DMs: #{length(single_dms)}"
    IO.puts "Multi DMs: #{length(multi_dms)}"

    IO.puts "Messages: #{count_messages(group_ids)}"
    IO.puts "Signle DM Messages: #{count_messages(single_dms)}"
    IO.puts "Multi DM Messages: #{count_messages(multi_dms)}"

    IO.puts "Migrated Messages: #{count_migrated_messages(group_ids)}"
    IO.puts "Migrated Signle DM Messages: #{count_migrated_messages(single_dms)}"
    IO.puts "Migrated Multi DM Messages: #{count_migrated_messages(multi_dms)}"
  end

  def count_messages(groups) do
    message_count =
      Message
      |> where([m], m.group_id in ^groups)
      |> select([m], count(m.id))
      |> Repo.one
  end

  def count_migrated_messages(groups) do
    message_count =
      Message
      |> where([m], m.group_id in ^groups)
      |> where([m], not is_nil(m.meteor_id))
      |> select([m], count(m.id))
      |> Repo.one
  end
end
