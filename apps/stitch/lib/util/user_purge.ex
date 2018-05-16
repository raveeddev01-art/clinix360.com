# defmodule Stitch.User.Purge do
#   alias Stitch.{Repo, Message, GroupUser, Invitation, Accounts.User, Team, Group}

#   def dangerously_purge_user(user) do
#     team = Team |> Repo.get(Team, user.team_id) |> Repo.preload(:groups)
#     team_groups_to_reassign = team.groups |> Enum.filter(&(&1.creator_user_id == user.id))

#     GroupUser |> where(user_id: ^user_id)
#   end
# end
