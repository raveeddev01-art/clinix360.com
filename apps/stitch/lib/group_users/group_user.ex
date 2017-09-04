defmodule Stitch.GroupUser do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{ Repo, GroupUser, Group, Accounts }

  schema "group_users" do
    belongs_to :group, Group
    belongs_to :user, Accounts.User
    field :is_favorite, :boolean, default: false
    field :desktop_notification_preference, :string, default: "default"
    field :mobile_notification_preference, :string, default: "default"
    field :mentioning_message_ids, {:array, :integer}, default: []

    timestamps()
  end

  def changeset(%GroupUser{} = struct, params) do
    struct
    |> cast(params, [:group_id, :user_id])
    |> validate_required([:group_id, :user_id])
    |> validate_inclusion(:desktop_notification_preference, ["everything", "mentions", "nothing", "default"])
    |> validate_inclusion(:mobile_notification_preference, ["everything", "mentions", "nothing", "default"])
    |> unique_constraint(:user_id, name: :group_users_group_user_id_unique_index, message: "User is already part of group")
  end

  def preference_changeset(%GroupUser{} = struct, params) do
    struct
    |> cast(params, [:desktop_notification_preference, :mobile_notification_preference])
    |> validate_required([:desktop_notification_preference, :mobile_notification_preference])
    |> validate_inclusion(:desktop_notification_preference, ["everything", "mentions", "nothing"])
    |> validate_inclusion(:mobile_notification_preference, ["everything", "mentions", "nothing"])
  end

  def remove_all_users(group_id) do
    from(u in GroupUser, where: u.group_id == ^group_id) |> Repo.delete_all
  end

  def update_preference(slug, user, %{"desktop_notification_preference" => desktop_notification_preference}) do
    case get_for_preference_update(slug, user) do
      nil -> {:error, "Not found"}
      group_user ->
        if group_user.desktop_notification_preference == desktop_notification_preference do
          {:error, "Not found"}
        else
          group_user
          |> preference_changeset(%{desktop_notification_preference: desktop_notification_preference})
          |> Repo.update
        end
    end

    get_for_preference_update(slug, user)
  end
  def update_preference(slug, user, _parms), do: {:error, "Not found"}

  def get_for_preference_update(slug, user) do
    GroupUser
    |> join(:inner, [gu], g in Group, gu.group_id == g.id and gu.user_id == ^user.id)
    |> where([gu, g], g.name != "__dm_group__" and g.slug == ^slug)
    |> Repo.one
  end

  def mentions_count(group_id, user_id) do
    GroupUser
    |> where(group_id: ^group_id, user_id: ^user_id)
    |> select([gu], fragment("COALESCE(ARRAY_LENGTH(?, 1), 0)", gu.mentioning_message_ids))
    |> Repo.one
  end
end
