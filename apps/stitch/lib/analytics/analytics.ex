defmodule Stitch.Analytics do
  @moduledoc """
  Provides conveniences for recording data on Stitch's analytics data store,
  Segment (https://segment.com/).

  """

  import Ecto.Query
  alias Stitch.Analytics.Event
  alias Stitch.Repo
  alias Stitch.Accounts.User

  @doc """
  Gets user traits, gets team traits, and records them. It associates an
  identified user with their team.

  ## Example

      iex> identify_and_group(%User{...})
      :ok

  """
  @spec identify_and_group(User.t) :: :ok | :error
  def identify_and_group(%User{} = user) do
    team            = Stitch.TeamQueries.get_by_id(user.team_id)
    subscription    = Stitch.Billing.get_subscription(team)
    identify_traits = identify_traits(user, team, subscription)
    group_traits    = group_traits(team, subscription)

    with {:ok, _} <- identify(user.id, identify_traits),
         {:ok, _} <- group(%{user_id: user.id, team_id: team.id}, group_traits) do
      :ok
    else
      _ -> :error
    end
  end

  @doc """
  Gets user traits and records them.

  ## Example

      iex> identify(%User{...})
      {:ok, %Event{...}}

  """
  @spec identify(User.t) :: {:ok, Event.t} | {:error, Ecto.Changeset.t}
  def identify(%User{} = user) do
    team         = Stitch.TeamQueries.get_by_id(user.team_id)
    subscription = Stitch.Billing.get_subscription(team)
    traits       = identify_traits(user, team, subscription)
    identify(user.id, traits)
  end

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
      userId: ensure_binary(user_id), # segment expects camelCase (userId)
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
      userId: ensure_binary(user_id), # segment expects camelCase (userId)
      groupId: ensure_binary(team_id), # segment expects camelCase (groupId)
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
      userId: ensure_binary(user_id), # segment expects camelCase (userId)
      event: event,
      properties: properties,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601()
    }
    create_event(%{payload: payload})
  end

  defp create_event(params) do
    params
    |> Event.new()
    |> Repo.insert()
  end

  defp ensure_binary(arg) when is_binary(arg), do: arg
  defp ensure_binary(arg) when is_integer(arg), do: Integer.to_string(arg)

  defp identify_traits(user, team, subscription) do
    status = if user.disabled, do: "disabled", else: "enabled"
    %{"email"     => user.email,
      "team_name" => team.name,
      "team_slug" => team.slug,
      "team_id"   => Integer.to_string(team.id),
      "plan"      => subscription.tier,
      "status"    => status}
  end

  defp group_traits(team, subscription) do
    %{"team_name" => team.name,
      "team_slug" => team.slug,
      "team_id"   => Integer.to_string(team.id),
      "plan"      => subscription.tier}
  end

  @doc false
  def list_events() do
    Repo.all(Event)
  end

  @doc false
  def list_events([limit: limit]) do
    query =
      from e in Event,
      limit: ^limit
    Repo.all(query)
  end

  @doc false
  def delete_events(events) do
    ids = Enum.map(events, &(&1.id))
    query =
      from e in Event,
      where: e.id in ^ids
    Repo.delete_all(query)
  end

end
