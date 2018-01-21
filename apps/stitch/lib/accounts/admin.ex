defmodule Stitch.Accounts.Admin do
  @moduledoc """
  The Accounts Admin context. Operations for administering a
  users account.
  """

  alias Stitch.Repo
  alias Stitch.Accounts.User
  alias Stitch.Team
  alias Stitch.Group
  alias Stitch.GroupUser
  alias Stitch.GroupQueries

  @analytics Application.get_env(:stitch, :analytics)

  @doc """
  Sets the disabled boolean flag to false for the provided user.
  """
  def activate(%Team{id: team_id}, user_id) do
    if user = Repo.get_by(User, team_id: team_id, id: user_id) do
      result =
        user
        |> Ecto.Changeset.change(disabled: false)
        |> Repo.update
      case result, do: ({:ok, updated_user} -> analytics_identify(updated_user); _ -> :ignore)
      case result, do: ({:ok, updated_user} -> GroupUser.clear_counters(updated_user); _ -> :ignore)
      result
    else
      {:error, :not_found}
    end
  end

  @doc """
  Sets the disabled boolean flag to true for the provided user.
  """
  def deactivate(%Team{id: team_id}, user_id) do
    if user = Repo.get_by(User, team_id: team_id, id: user_id) do
      analytics_track_user_disabled(user)
      result =
        user
        |> Ecto.Changeset.change(disabled: true)
        |> Repo.update
      case result, do: ({:ok, updated_user} -> analytics_identify(updated_user); _ -> :ignore)
      result
    else
      {:error, :not_found}
    end
  end

  defp analytics_track_user_disabled(user) do
    Stitch.Task.start(fn ->
      team_id = user.team_id
      team = Stitch.TeamQueries.get_by_id(team_id)
      active_users = Stitch.TeamQueries.list_active_users(team)
      properties = %{
        "first_name"   => user.first_name,
        "last_name"    => user.last_name,
        "email"        => user.email,
        "team_id"      => Integer.to_string(team.id),
        "team_name"    => team.name,
        "team_slug"    => team.slug,
        "active_users" => length(active_users)
      }
      Stitch.Analytics.track(user.id, "Account Disabled", properties)
    end)
  end

  @doc """
  Updates the user information
  """

  def update_user(user_id, params)
  when is_integer(user_id) and is_map(params) do
    result =
      Repo.get(User, user_id)
      |> User.changeset(params)
      |> Repo.update

    case result, do: ({:ok, updated_user} -> analytics_identify(updated_user); _ -> :ignore)
    result
  end
  def update_user(_, _), do: {:error, "Invalid User ID or Parameters"}

  def promote_admin(promoter, target_id) do
    user = Repo.get_by!(User, id: target_id, team_id: promoter.team_id)

    if user.id != promoter.id do
      changeset = Ecto.Changeset.change(user, roles: ["admin"])
      case Repo.update(changeset) do
        {:error, _changeset} ->
          {:error, "Failed to promote user."}
        {:ok, updated_user} = success ->
          analytics_identify(updated_user)
          success
      end
    else
      {:error, "You cannot promote own account."}
    end
  end

  def revoke_admin(revoker, target_id) do
    user = Repo.get_by!(User, id: target_id, team_id: revoker.team_id)

    if user.id != revoker.id do
      changeset = Ecto.Changeset.change(user, roles: ["member"])
      case Repo.update(changeset) do
        {:error, _changeset} ->
          {:error, "Failed to revoke admin role from user."}
        {:ok, updated_user} = success ->
          analytics_identify(updated_user)
          success
      end
    else
      {:error, "You cannot revoke admin role from your own account."}
    end
  end

  @spec update_unread_message_notification_interval(number, number) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user unread_message_notification_interval field.
  """
  def update_unread_message_notification_interval(_user_id, _notification_interval) do
    # TODO
  end

  defp analytics_identify(user) do
    Task.start(fn -> @analytics.identify(user) end)
  end

  @doc """
  Changes a user's role.
  If the user's role is set to `single-room-guest` or `multi-room-guest`, then the
  passed in groups will be validated.
  """
  @spec change_role(User.t, Map.t) :: {:ok, User.t} | {:error, :invalid_group_size | Ecto.Changeset.t}
  def change_role(%User{} = user, %{role: "member" = role}) do
    do_change_role(user, role, [])
  end
  def change_role(%User{} = user, %{role: "single-room-guest" = role, groups_as_guest: group_ids}) do
    with {:ok, [_group]} <- fetch_groups_by_ids(group_ids, user) do
      do_change_role(user, role, group_ids)
    else
      {:ok, _} -> {:error, :invalid_group_size}
      error -> error
    end
  end
  def change_role(%User{} = user, %{role: "multi-room-guest" = role, groups_as_guest: group_ids}) do
    with {:ok, [_|_]} <- fetch_groups_by_ids(group_ids, user) do
      do_change_role(user, role, group_ids)
    else
      {:ok, _} -> {:error, :invalid_group_size}
      error -> error
    end
  end

  defp do_change_role(%User{} = user, role, group_ids) do
    params = %{roles: [role], groups_as_guest: group_ids}

    user
    |> User.role_change_changeset(params)
    |> Repo.update()
  end

  defp fetch_groups_by_ids(group_ids, %User{} = user) do
    groups = GroupQueries.get_by_ids(group_ids, user)
    if length(groups) != length(group_ids) do
      {:error, :invalid_group_ids}
    else
      {:ok, groups}
    end
  end

  @guest_roles ["single-room-guest", "multi-room-guest"]

  @doc """
  Ensures that a user joins and leaves the proper groups based on their role and group restrictions.
  """
  @spec update_user_group_memberships(User.t) :: {removed_groups :: [Group.t], added_groups :: [Group.t]}
  def update_user_group_memberships(%User{roles: [role]} = user) when role in @guest_roles do
    user
    |> GroupQueries.non_dm_group_memberships()
    |> Enum.reduce({user.groups_as_guest, []}, &do_identify_group_membership_diff/2)
    |> do_update_user_group_memberships(user)
  end
  def update_user_group_memberships(%User{id: user_id, roles: ["member"]} = user) do
    default_group = GroupQueries.default_group(user)
    if GroupQueries.user_is_member?(default_group.id, user_id) do
      {[], []}
    else
      Group.add_user(default_group, user)
      {[], [default_group]}
    end
  end
  def update_user_group_memberships(_), do: {[], []}

  defp do_identify_group_membership_diff(%{group_id: group_id} = group_user, {group_ids_to_add, group_users_to_remove}) do
    if group_id not in group_ids_to_add do
      {group_ids_to_add, [group_user | group_users_to_remove]}
    else
      {List.delete(group_ids_to_add, group_id), group_users_to_remove}
    end
  end

  defp do_update_user_group_memberships({group_ids_to_add, group_users_to_remove}, user) do
    added_groups =
      for group_id <- group_ids_to_add do
        group = GroupQueries.get_by_id(group_id)
        Group.add_user(group, user)
        group
      end
    removed_groups =
      for gu <- group_users_to_remove do
        Group.remove_user(gu.group, user)
        gu.group
      end
    {added_groups, removed_groups}
  end
end
