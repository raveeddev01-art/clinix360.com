defmodule Stitch.GroupUser do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{ Repo, GroupUser, Group, Accounts }

  schema "group_users" do
    belongs_to :group, Group
    belongs_to :user, Accounts.User
    field :is_favorite, :boolean, default: false
    field :notification_preference, :string, default: "default"
    field :mentioning_message_ids, {:array, :integer}, default: []

    timestamps()
  end

  def changeset(%GroupUser{} = struct, params) do
    struct
    |> cast(params, [:group_id, :user_id])
    |> validate_required([:group_id, :user_id])
    |> validate_inclusion(:notification_preference, ["everything", "mentions", "nothing", "default"])
    |> unique_constraint(:user_id, name: :group_users_group_user_id_unique_index, message: "User is already part of group")
  end

  def preference_changeset(%GroupUser{} = struct, params) do
    struct
    |> cast(params, [:notification_preference])
    |> validate_required([:notification_preference])
    |> validate_inclusion(:notification_preference, ["everything", "mentions", "nothing"])
  end

  def users_with_all_notification_enabled(group_users) do
    group_users
    |> Enum.filter(fn group_user ->
      if group_user.notification_preference == "default" do
        group_user.user.notification_preference == "everything"
      else
        group_user.notification_preference == "everything"
      end
    end)
    |> Enum.map(& &1.user_id)
  end

  def users_with_all_notification_disabled(group_users) do
    group_users
    |> Enum.filter(fn group_user ->
      if group_user.notification_preference == "default" do
        group_user.user.notification_preference == "nothing"
      else
        group_user.notification_preference == "nothing"
      end
    end)
    |> Enum.map(& &1.user_id)
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

  def for_group(group_id) do
    GroupUser
    |> where([g], g.group_id == ^group_id)
    |> preload(:user)
    |> Repo.all
  end
end
