defmodule Stitch.Repo.Migrations.MoveIsFavoriteToGroupUser do
  use Ecto.Migration

  @disable_ddl_transaction true

  import Ecto.Query
  alias Stitch.{Repo, GroupUser}
  alias Stitch.Accounts.User

  def up do
    alter table(:group_users) do
      add :is_favorite, :boolean, default: false, null: false
    end

    flush()

    GroupUser
    |> join(:inner, [gu], u in assoc(gu, :user))
    |> where([gu, u], gu.group_id in u.favorite_groups)
    |> Repo.update_all(set: [is_favorite: true])

    alter table(:users) do
      remove :favorite_groups
    end
  end

  def down do
    alter table(:users) do
      add :favorite_groups, {:array, :integer}, default: []
    end

    flush()

    User
    |> join(:inner, [u], gu in GroupUser, gu.user_id == u.id and gu.is_favorite)
    |> group_by([u, gu], u.id)
    |> select([u, gu], {u, fragment("array_agg(?)", gu.group_id)})
    |> Repo.all
    |> Enum.each(fn {user, favorite_group_ids} ->
      User.changeset(user, %{favorite_groups: favorite_group_ids}) |> Repo.update!
    end)

    alter table(:group_users) do
      remove :is_favorite
    end
  end
end
