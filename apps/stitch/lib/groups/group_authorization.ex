defmodule Stitch.GroupAuthorization do
  @moduledoc """
  Module in charge of permission handling for group actions.
  """

  alias Stitch.{Group, Accounts.User, GroupUser}

  @dm_groups ["__dm_group__", "__multi_dm_group__"]

  @doc """
  """
  def can_view?(%Group{team_id: team_id} = group, %User{team_id: team_id} = user) do
    if User.guest?(user) do
      is_member?(group.id, user.id)
    else
      group.public || is_member?(group.id, user.id) || Enum.member?(user.roles, "admin")
    end
  end

  def can_view?(_group, _user), do: false

  @doc """
  Return true/false whether user can rename this group.
  """
  def can_rename?(%Group{name: name}, _user) when name in @dm_groups, do: false
  def can_rename?(%Group{creator_user_id: user_id}, %User{id: user_id}), do: true

  def can_rename?(%Group{team_id: team_id} = group, %User{team_id: team_id} = user) do
    "admin" in user.roles || (group.public && !User.guest?(user))
  end

  def can_rename?(_group, _user), do: false

  @doc """
  Return true/false whether user can invite other users to this group.
  """
  def can_invite?(%Group{team_id: team_id} = group, %User{team_id: team_id} = user) do
    Enum.member?(user.roles, "admin") || group.public || group.creator_user_id == user.id
  end

  def can_invite?(_group, _user), do: false

  @doc """
  Return true/false whether user can change the public setting for groups.
  """
  def can_toggle_public?(%User{} = user), do: !User.guest?(user)
  def can_toggle_public?(%Group{creator_user_id: user_id}, %User{id: user_id}), do: true

  def can_toggle_public?(%Group{team_id: team_id}, %User{team_id: team_id} = user) do
    "admin" in user.roles
  end

  def can_toggle_public?(_group, _user), do: false

  @doc """
  Checks if a user is authorized to create groups.
  """
  def can_create?(%User{} = user) do
    !User.guest?(user)
  end

  @doc """
  Checks if a user is authorized to remove the group
  """
  @spec can_delete?(Group.t(), User.t()) :: boolean
  def can_delete?(%Group{name: name}, _user) when name in @dm_groups, do: false
  def can_delete?(%Group{is_default: true}, _user), do: false

  def can_delete?(%Group{team_id: team_id} = group, %User{team_id: team_id, roles: roles} = user) do
    if User.guest?(user) do
      false
    else
      "admin" in roles || (is_member?(group.id, user.id) && is_creator?(group, user))
    end
  end

  def can_delete?(_group, _user), do: false

  @doc """
  Checks if a user is authorized to join groups based on role.
  """
  def can_join?(%User{} = user) do
    !User.guest?(user)
  end

  @doc """
  Checks if a user is authorized to join groups based on role.
  """
  def can_leave?(%User{} = user) do
    !User.guest?(user)
  end

  @doc """
  Checks if a user is the creator of the room
  """
  @spec is_creator?(Group.t(), User.t()) :: boolean
  def is_creator?(%Group{creator_user_id: user_id}, %User{id: user_id}), do: true
  def is_creator?(_group, _user), do: false

  @doc """
  Checks if a user is the room member
  """
  @spec is_member?(pos_integer, pos_integer) :: boolean
  def is_member?(group_id, user_id) do
    Stitch.GroupQueries.user_is_member?(group_id, user_id)
  end

  @spec can_message?(Group.t(), pos_integer) :: boolean
  def can_message?(%Group{} = group, user_id) do
    if is_member?(group.id, user_id) do
      if Group.direct_message?(group) do
        member_ids = GroupUser.user_ids(group.id)
        personal_dm?(member_ids, user_id) || any_member_enabled?(member_ids, user_id)
      else
        true
      end
    else
      false
    end
  end

  def personal_dm?(member_ids, user_id) do
    member_ids == [user_id]
  end

  defp any_member_enabled?(member_ids, user_id) do
    member_ids
    |> List.delete(user_id)
    |> Stitch.UserQueries.any_enabled?()
  end
end
