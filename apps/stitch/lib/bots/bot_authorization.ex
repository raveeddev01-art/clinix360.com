defmodule Stitch.BotAuthorization do
  import Ecto.Query
  alias Stitch.Repo
  alias Stitch.{Team, Accounts.User}

  @spec can_list_bots?(number, number) :: boolean
  def can_list_bots?(team_id, user_id) when is_number(team_id) and is_number(user_id) do
    query =
      from(
        u in User,
        where: u.team_id == ^team_id,
        where: u.id == ^user_id,
        where: "admin" == fragment("ANY (?)", u.roles)
      )

    case Repo.one(query) do
      nil ->
        false

      _ ->
        true
    end
  end

  def can_list_bots?(_, _), do: false

  @spec can_create_bot?(number, number) :: boolean
  def can_create_bot?(team_id, user_id) when is_number(team_id) and is_number(user_id) do
    query =
      from(
        u in User,
        where: u.team_id == ^team_id,
        where: u.id == ^user_id,
        where: "admin" == fragment("ANY (?)", u.roles)
      )

    case Repo.one(query) do
      nil ->
        false

      _ ->
        true
    end
  end

  def can_create_bot?(_, _), do: false

  @spec can_edit_bot?(number, number) :: boolean
  def can_edit_bot?(team_id, user_id) when is_number(team_id) and is_number(user_id) do
    query =
      from(
        u in User,
        where: u.team_id == ^team_id,
        where: u.id == ^user_id,
        where: "admin" == fragment("ANY (?)", u.roles)
      )

    case Repo.one(query) do
      nil ->
        false

      _ ->
        true
    end
  end

  def can_edit_bot?(_, _), do: false
end
