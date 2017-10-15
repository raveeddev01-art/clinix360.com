defmodule Stitch.GroupAuthorization do
  @moduledoc """
  Module in charge of permission handling for group actions.
  """

  alias Stitch.Repo
  alias Stitch.{Group, GroupUser}

  @doc """
  """
  def can_view?(group_id, user_id) do
    group = Repo.get(Group, group_id)
    group.public ||
      Repo.get_by(GroupUser, group_id: group_id, user_id: user_id) != nil
  end

  @doc """
  """
  def is_member?(group_id, user_id) do
    Repo.get_by(GroupUser, group_id: group_id, user_id: user_id) != nil
  end

  @doc """
  Return true/false whether user can rename this group.
  """
  def can_rename?(group, user) do
    Enum.member?(user.roles, "admin") || group.public || group.creator_user_id == user.id
  end

  @doc """
  Return true/false whether user can invite other users to this group.
  """
  def can_invite?(group, user) do
    Enum.member?(user.roles, "admin") || group.public || group.creator_user_id == user.id
  end

  @doc """
  Return true/false whether user can change the public setting for this group.
  """
  def can_toggle_public?(group, user) do
    Enum.member?(user.roles, "admin") || group.creator_user_id == user.id
  end
end
