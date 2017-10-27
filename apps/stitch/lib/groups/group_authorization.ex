defmodule Stitch.GroupAuthorization do
  @moduledoc """
  Module in charge of permission handling for group actions.
  """

  alias Stitch.{Repo, Group, Accounts.User}

  @doc """
  """
  def can_view?(%Group{team_id: team_id} = group, %User{team_id: team_id} = user) do
    group.public || is_member?(group.id, user.id) || Enum.member?(user.roles, "admin")
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
  def can_rename?(%Group{team_id: team_id} = group, %User{team_id: team_id} = user) do
    Enum.member?(user.roles, "admin") || group.public || group.creator_user_id == user.id
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
  Return true/false whether user can change the public setting for this group.
  """
  def can_toggle_public?(%Group{team_id: team_id} = group, %User{team_id: team_id} = user) do
    Enum.member?(user.roles, "admin") || group.creator_user_id == user.id
  end
  def can_toggle_public?(_group, _user), do: false
end
