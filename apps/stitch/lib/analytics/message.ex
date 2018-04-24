defmodule Stitch.Analytics.Message do
  @moduledoc """
  Manage message analytics.
  """

  @analytics Application.get_env(:stitch, :analytics)

  # === EVENT NAMES ===

  @event_message_sent "Message Sent"

  @doc """
  Logs message send analytics
  """
  def track_message_sent(message, user, group) do
    Stitch.Task.start(fn ->
      do_track_message_sent(message, user, group)
    end)
  end

  # ============
  #   PRIVATE
  # ============

  defp do_track_message_sent(message, user, group) do
    team = Stitch.TeamQueries.get_by_id(user.team_id)

    @analytics.track(
      user.id,
      @event_message_sent,
      message_properties(message, user, group, team)
    )
  end

  defp message_properties(message, user, group, team) do
    %{
      "message_client_device_type" => message.client_device_type,
      "message_client_name" => message.client_name,
      "message_client_os" => message.client_os,
      "message_type" => message.type,
      "room_id" => Integer.to_string(group.id),
      "room_slug" => group.slug,
      "team_created_at" => team.inserted_at,
      "team_id" => Integer.to_string(team.id),
      "team_slug" => team.slug,
      "user_created_at" => user.inserted_at
    }
  end
end
