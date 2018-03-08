defmodule Stitch.BotAuthorization do
  alias Stitch.Repo
  alias Stitch.{Team, Accounts.User}

  @spec can_list_bots?(number, number) :: boolean
  def can_list_bots?(team_id, user_id) when is_number(team_id) and is_number(user_id) do
    with team when not is_nil(team) <- Repo.get(Team, team_id),
         user when not is_nil(user) <- Repo.get_by(User, id: user_id, team_id: team_id) do
      "admin" in user.roles
    else
      _ -> false
    end
  end

  def can_list_bots?(_, _), do: false

  @spec can_create_bot?(number, number) :: boolean
  def can_create_bot?(team_id, user_id) when is_number(team_id) and is_number(user_id) do
    with team when not is_nil(team) <- Repo.get(Team, team_id),
         user when not is_nil(user) <- Repo.get_by(User, id: user_id, team_id: team_id) do
      "admin" in user.roles
    else
      _ -> false
    end
  end

  def can_create_bot?(_, _), do: false

  @spec can_edit_bot?(number, number) :: boolean
  def can_edit_bot?(team_id, user_id) when is_number(team_id) and is_number(user_id) do
    with team when not is_nil(team) <- Repo.get(Team, team_id),
         user when not is_nil(user) <- Repo.get_by(User, id: user_id, team_id: team_id) do
      "admin" in user.roles
    else
      _ -> false
    end
  end

  def can_edit_bot?(_, _), do: false

  @spec can_delete_bot?(number, number) :: boolean
  def can_delete_bot?(team_id, user_id) when is_number(team_id) and is_number(user_id) do
    with team when not is_nil(team) <- Repo.get(Team, team_id),
         user when not is_nil(user) <- Repo.get_by(User, id: user_id, team_id: team_id) do
      "admin" in user.roles
    else
      _ -> false
    end
  end

  def can_delete_bot?(_, _), do: false
end
