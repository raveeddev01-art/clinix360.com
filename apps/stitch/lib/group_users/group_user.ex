defmodule Stitch.GroupUser do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{Repo, GroupUser, Group, Accounts}

  schema "group_users" do
    belongs_to :group, Group
    belongs_to :user, Accounts.User
    field :is_favorite, :boolean, default: false
    field :is_hidden, :boolean, default: false
    field :desktop_notification_preference, :string, default: "default"
    field :mobile_notification_preference, :string, default: "default"
    field :unread_messages_count, :integer, default: 0
    field :mentions_count, :integer, default: 0
    field :last_read_at, :naive_datetime

    timestamps()
  end

  def clear_counters(%Accounts.User{} = user) do
    GroupUser
    |> where(user_id: ^user.id)
    |> Repo.update_all(set: [last_read_at: DateTime.utc_now, mentions_count: 0, unread_messages_count: 0])
  end

  def changeset(%GroupUser{} = struct, params) do
    struct
    |> cast(params, [:group_id, :user_id])
    |> validate_required([:user_id])
    |> validate_inclusion(:desktop_notification_preference, ["everything", "mentions", "nothing", "default"])
    |> validate_inclusion(:mobile_notification_preference, ["everything", "mentions", "nothing", "default"])
    |> unique_constraint(:user_id, name: :group_users_group_user_id_unique_index, message: "User is already part of room")
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

  def update_preference(group_id, user_id, %{} = preferences) do
    with {:ok, group_user} <- get_preference(group_id, user_id) do
      group_user
      |> preference_changeset(preferences)
      |> Repo.update
    end
  end

  def batch_preference_update([], _user), do: nil
  def batch_preference_update(group_preferences, user) when is_list(group_preferences) do
    group_preferences
    |> Enum.each(fn
      %{"group_id" => group_id} = group_preference ->
        case get_preference(group_id, user.id) do
          {:ok, group_user} ->
            updated_preferences = %{}
            desktop_notification_preference = group_preference["desktop_notification_preference"]
            mobile_notification_preference = group_preference["mobile_notification_preference"]

            updated_preferences =
              if desktop_notification_preference &&
                not (group_user.desktop_notification_preference == "default" &&
                user.desktop_notification_preference == desktop_notification_preference) do
                  Map.put(updated_preferences, "desktop_notification_preference", desktop_notification_preference)
              else
                updated_preferences
              end

            updated_preferences =
              if mobile_notification_preference &&
                not (group_user.mobile_notification_preference == "default" &&
                user.mobile_notification_preference == mobile_notification_preference) do
                  Map.put(updated_preferences, "mobile_notification_preference", mobile_notification_preference)
              else
                updated_preferences
              end

            group_user
            |> preference_changeset(updated_preferences)
            |> Repo.update
          _ -> nil
        end
      _ -> nil
    end)
  end

  def get_preference(group_id, user_id) do
    group_user = GroupUser
    |> where(group_id: ^group_id, user_id: ^user_id)
    |> preload([:group, :user])
    |> Repo.one

    if group_user && group_user.group.name != "__dm_group__" do
      {:ok, group_user}
    else
      {:error, "Not found"}
    end
  end

  def user_ids(group_id) do
    GroupUser
    |> where(group_id: ^group_id)
    |> select([gu], gu.user_id)
    |> Repo.all
  end
end
