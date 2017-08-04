defmodule Stitch.GroupAuthorization do
  @moduledoc """
  Module in charge of permission handling for group actions.
  """

  alias Stitch.Repo
  alias Stitch.Group
  alias Stitch.Accounts.User
  import Ecto.Query

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