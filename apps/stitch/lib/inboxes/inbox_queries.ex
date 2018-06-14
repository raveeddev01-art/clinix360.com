defmodule Stitch.Engage.InboxQueries do
  @moduledoc """
  Queries used for Inbox and inbox-related logic.
  """

  import Ecto.Query
  alias Stitch.{Repo, Team, Engage.Inbox}

  @doc """
  Given a team or team_id, return the defualt inbox.
  """
  @spec default_for_team(number | binary | Team.t()) :: Inbox.t() | nil
  def default_for_team(team_id) when is_integer(team_id) or is_binary(team_id) do
    Inbox
    |> where(is_default: true, team_id: ^team_id)
    |> Repo.one()
  end

  def default_for_team(%Team{} = team) do
    default_for_team(team.id)
  end
end
