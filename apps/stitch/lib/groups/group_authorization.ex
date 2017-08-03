defmodule Stitch.GroupAuthorization do
  @moduledoc """
  Module in charge of permission handling for group actions.
  """

  alias Stitch.Repo
  alias Stitch.Group
  alias Stitch.Accounts.User
  import Ecto.Query

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
end