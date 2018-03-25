alias Stitch.Group
alias Stitch.Repo

defmodule Stitch.Analytics.Group do
  @moduledoc """
  Manage group analytics events.
  """

  @analytics Application.get_env(:stitch, :analytics)

  # === EVENT NAMES ===

  @event_group_created "Group Created"

  @doc """
  Logs group creation events. Normal, Private, Single-DM, Multi-DM
  """
  @spec track_creation(User.t, Group.t) :: {:ok, pid()}
  def track_creation(group, group_creator) do
    Stitch.Task.start fn ->
      do_track_creation(group, group_creator)
    end
  end

  # ============
  #   PRIVATE
  # ============

  defp do_track_creation(group, group_creator) do
    group_with_team = Repo.preload(group, :team)

    @analytics.track(
      @event_group_created,
      group_event_properties(group_with_team, group_creator)
    )
  end

  defp group_event_properties(group, creator) do
    %{
      "group_created_at" => group.inserted_at,
      "group_id"         => Integer.to_string(group.id),
      "group_is_public"  => group.public,
      "group_type"       => Group.type(group),
      "team_created_at"  => group.team.inserted_at,
      "team_id"          => Integer.to_string(group.team.id),
      "team_name"        => group.team.name,
      "team_slug"        => group.team.slug,
      "user_created_at"  => creator.inserted_at
    }
  end
end
