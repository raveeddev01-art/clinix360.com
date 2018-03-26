defmodule Stitch.Analytics.Accounts do
  @moduledoc """
  Manage accounts analytics.
  """

  @analytics Application.get_env(:stitch, :analytics)

  # === EVENT NAMES ===

  @event_team_created "Team Created"
  @event_team_joined "Joined Team"

  @doc """
  Logs events on user signup:
    - User Identification
    - Team Joined
    - Team Created (if new)
  """
  def track_signup(user) do
    Stitch.Task.start fn ->
      identify_and_group(user)

      team = Stitch.TeamQueries.get_by_id(user.team_id)
      active_users = Stitch.TeamQueries.list_active_users(team)

      track_joined_team(user, team, active_users)

      if Enum.count(active_users) == 1 do
        track_new_team(user, team)
      end
    end
  end

  # ============
  #   PRIVATE
  # ============

  defp identify_and_group(user) do
    Stitch.Task.start fn ->
      @analytics.identify_and_group(user)
    end
  end

  defp track_joined_team(user, team, active_users) do
    Stitch.Task.start fn ->
      properties = accounts_event_properties(user, team)
        |> Map.merge(%{"active_users" => length(active_users)})

      @analytics.track(
        user.id,
        @event_team_joined,
        properties
      )
    end
  end

  defp track_new_team(user, team) do
    Stitch.Task.start fn ->
      @analytics.track(
        user.id,
        @event_team_created,
        accounts_event_properties(user, team)
      )
    end
  end

  # === HELPERS ===

  defp accounts_event_properties(user, team) do
    %{
      "email"           => user.email,
      "first_name"      => user.first_name,
      "last_name"       => user.last_name,
      "team_created_at" => team.inserted_at,
      "team_id"         => Integer.to_string(team.id),
      "team_name"       => team.name,
      "team_slug"       => team.slug
    }
  end
end
