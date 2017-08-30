defmodule Stitch.GroupUser do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{ Repo, GroupUser, Group, Accounts }

  schema "group_users" do
    belongs_to :group, Group
    belongs_to :user, Accounts.User
    field :mentioning_message_ids, :map, default: %{}
    field :is_favorite, :boolean, default: false
    field :mentioning_message_ids, {:array, :integer}, default: []

    timestamps()
  end

  def changeset(%GroupUser{} = struct, params) do
    struct
    |> cast(params, [:group_id, :user_id])
    |> validate_required([:group_id, :user_id])
    |> unique_constraint(:user_id, name: :group_users_group_user_id_unique_index, message: "User is already part of group")
  end

  def remove_all_users(group_id) do
    from(u in GroupUser, where: u.group_id == ^group_id) |> Repo.delete_all
  end

  def mentions_count(group_id, user_id) do
    GroupUser
    |> where(group_id: ^group_id, user_id: ^user_id)
    |> select([gu], fragment("COALESCE(ARRAY_LENGTH(?, 1), 0)", gu.mentioning_message_ids))
    |> Repo.one
  end
end
