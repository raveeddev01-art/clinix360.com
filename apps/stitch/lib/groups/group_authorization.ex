defmodule Stitch.GroupAuthorization do
  @moduledoc """
  Module in charge of permission handling for group actions.
  """

  alias Stitch.{Repo, Group, Accounts.User}

  @dm_groups ["__dm_group__", "__multi_dm_group__"]

  @doc """
  """
  def can_view?(%Group{team_id: team_id} = group, %User{team_id: team_id} = user) do
    if User.guest?(user) do
      is_member?(group.id, user.id)
    else
      (group.public || is_member?(group.id, user.id)) || Enum.member?(user.roles, "admin")
    end
  end
  def can_view?(_group, _user), do: false

  @doc """
  """
  def is_member?(group_id, user_id) do
    Repo.get_by(Stitch.GroupUser, group_id: group_id, user_id: user_id) != nil
  end

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
end
