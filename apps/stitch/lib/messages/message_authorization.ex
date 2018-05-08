defmodule Stitch.MessageAuthorization do
  alias Stitch.{Accounts.User, Message, Group}

  def can_delete?(%Message{user_id: user_id}, %User{id: user_id}, _group), do: true

  def can_delete?(%Message{}, %User{roles: roles, team_id: team_id}, %Group{team_id: team_id}) do
    "admin" in roles
  end

  def can_delete?(_, _, _), do: false
end
