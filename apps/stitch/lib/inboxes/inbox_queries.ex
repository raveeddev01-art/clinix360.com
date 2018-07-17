defmodule Stitch.Engage.InboxQueries do
  @moduledoc """
  Queries used for Inbox and inbox-related logic.
  """

  import Ecto.Query

  alias Stitch.{
    Repo,
    Team,
    Patient,
    Accounts.User,
    Engage.Inbox,
    Engage.ConversationQueries
  }

  @doc """
  Given a team or team_id, return the default inbox for the team.
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

  @doc """
  Loads values/relaitonships needed to render main inbox page and merges into struct.
  """
  @spec with_show_values(Inbox.t(), User.t() | Patient.t()) :: Inbox.t()
  def with_show_values(%Inbox{id: inbox_id} = inbox, %User{} = user) do
    additional_attributes = %{
      open_conversations: ConversationQueries.latest_open_for_inbox(user, inbox_id),
      open_conversations_count: ConversationQueries.open_count_for_inbox(inbox_id),
      closed_conversations_count: ConversationQueries.closed_count_for_inbox(inbox_id)
    }

    Map.merge(inbox, additional_attributes)
  end

  def with_show_values(inbox, %Patient{}), do: inbox
end
