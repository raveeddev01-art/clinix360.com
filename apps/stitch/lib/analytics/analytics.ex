defmodule Stitch.Analytics do
  @moduledoc """
  Provides conveniences for recording data on Stitch's analytics data store,
  Segment (https://segment.com/).

  """

  alias Stitch.Analytics.Event
  alias Stitch.Repo

  @doc """
  Lets us tie a user to their actions and record traits about them.

  ## Example

      iex> identify(123, %{email: "some email"})
      {:ok, %Event{...}}

  """
  @spec identify(pos_integer, map) :: {:ok, Event.t} | {:error, Ecto.Changeset.t}
  def identify(user_id, traits) do
    payload = %{
      type: "identify",
      userId: Integer.to_string(user_id), # segment expects camelCase (userId)
      traits: traits,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601()
    }
    create_event(%{payload: payload})
  end

  @doc """
  Lets us associate an identified user with a team. It also lets us record
  traits about the team.

  Note that Segment uses the word group to refer to organizations, accounts,
  projects or teams. In our case what Segment calls groups is what we call teams.

  ## Example

      iex> group(%{user_id: 1234, team_id: 5678}, %{team_name: "some team name"})
      {:ok, %Event{...}}

  """
  @spec group(%{user_id: pos_integer, team_id: pos_integer}, map) ::
  {:ok, Event.t} | {:error, Ecto.Changeset.t}
  def group(%{user_id: user_id, team_id: team_id}, traits) do
    payload = %{
      type: "group",
      userId: Integer.to_string(user_id), # segment expects camelCase (userId)
      groupId: Integer.to_string(team_id), # segment expects camelCase (groupId)
      traits: traits,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601()
    }
    create_event(%{payload: payload})
  end

  @doc """
  Lets us record the actions users perform and it's associated properties.

  ## Example

      iex> track(1234, "some event", %{prop: "some prop"})
      {:ok, %Event{...}}

  """
  @spec track(pos_integer, String.t, map) ::
  {:ok, Event.t} | {:error, Ecto.Changeset.t}
  def track(user_id, event, properties) do
    payload = %{
      type: "track",
      userId: Integer.to_string(user_id), # segment expects camelCase (userId)
      event: event,
      properties: properties,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601()
    }
    create_event(%{payload: payload})
  end

  @doc false
  def list_events() do
    Repo.all(Event)
  end

  defp create_event(params) do
    params
    |> Event.new()
    |> Repo.insert()
  end

end
