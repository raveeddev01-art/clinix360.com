defmodule Stitch.GroupAuthorization do
  @moduledoc """
  Module in charge of permission handling for group actions.
  """

  alias Stitch.Repo
  alias Stitch.{Group, GroupUser}
  alias Stitch.Accounts.User
  import Ecto.Query

  @doc """
  """
  def can_view?(group_id, user_id) do
    group = Repo.get(Group, group_id)
    query =
      from gu in GroupUser,
      where: gu.group_id == ^group_id,
      where: gu.user_id == ^user_id
    group_user = Repo.one(query)
    group.public || group_user != nil
  end

  @doc """
  """
  def is_member?(group_id, user_id) do
    query =
      from gu in GroupUser,
      where: gu.group_id == ^group_id,
      where: gu.user_id == ^user_id
    group_user = Repo.one(query)
    group_user != nil
  end

  @doc """
  Return true/false whether user can invite other users to this group.
  """
  def can_invite?(group_id, user_id) do
    user = Repo.get(User, user_id)
    query =
      from g in Group,
      where: g.id == ^group_id,
      preload: [:creator]

    group = Repo.one(query)

    if Enum.member?(user.roles, "admin")
      || group.public
      || group.creator.id == user.id do
      true
    else
      false
    end
  end

  @doc """
  Return true/false whether user can change the public setting for this group.
  """
  def can_toggle_public?(group_id, user_id) do
    user = Repo.get(User, user_id)
    query =
      from g in Group,
      where: g.id == ^group_id,
      preload: [:creator]

    group = Repo.one(query)

    if Enum.member?(user.roles, "admin") || group.creator.id == user.id do
      true
    else
      false
    end
  end
end