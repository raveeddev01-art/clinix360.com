defmodule Stitch.Analytics.Invitation do
  @moduledoc """
  Manage invitation analytics.
  """

  @analytics Application.get_env(:stitch, :analytics)

  # === EVENT NAMES ===

  @event_new_invitation "Team Invitation Sent"

  @doc """
  Logs new invitation events
  """
  def track_new_invitation(user, email) do
    Stitch.Task.start fn ->
      do_track_new_invitation(user, email)
    end
  end

  # ============
  #   PRIVATE
  # ============

  defp do_track_new_invitation(user, email) do
    @analytics.track(
      user.id,
      @event_new_invitation,
      invitation_properties(user, email)
    )
  end

  defp invitation_properties(user, email) do
    team = Stitch.TeamQueries.get_by_id(user.team_id)
    active_users = Stitch.TeamQueries.list_active_users(team)

    %{
      "active_users" => length(active_users),
      "email"        => email,
      "first_name"   => user.first_name,
      "last_name"    => user.last_name,
      "team_created_at" => team.inserted_at,
      "team_id"      => Integer.to_string(team.id),
      "team_name"    => team.name,
      "team_slug"    => team.slug,
      "user_created_at"    => user.inserted_at
    }
  end
end
