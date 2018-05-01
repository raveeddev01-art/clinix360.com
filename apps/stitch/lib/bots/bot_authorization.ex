defmodule Stitch.BotAuthorization do
  import Ecto.Query
  alias Stitch.Repo
  alias Stitch.Accounts.User

  @spec can_list_bots?(number, number) :: boolean
  def can_list_bots?(team_id, user_id) when is_number(team_id) and is_number(user_id) do
    is_member_or_admin(team_id, user_id)
  end

  def can_list_bots?(_, _), do: false

  @spec can_create_bot?(number, number) :: boolean
  def can_create_bot?(team_id, user_id) when is_number(team_id) and is_number(user_id) do
    is_member_or_admin(team_id, user_id)
  end

  def can_create_bot?(_, _), do: false

  @spec can_edit_bot?(number, number) :: boolean
  def can_edit_bot?(team_id, user_id) when is_number(team_id) and is_number(user_id) do
    is_member_or_admin(team_id, user_id)
  end

  def can_edit_bot?(_, _), do: false

  defp is_member_or_admin(team_id, user_id) when is_number(team_id) and is_number(user_id) do
    role_query =
      from(
        u in User,
        where: u.team_id == ^team_id,
        where: u.id == ^user_id,
        select: u.roles
      )

    case Repo.one(role_query) do
      nil -> false
      roles -> Enum.member?(roles, "member") || Enum.member?(roles, "admin")
    end
  end
end
