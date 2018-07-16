defmodule StitchConnect.Web.UserStatusService do
  @moduledoc """
  Returns user status info in the format: {active: [], online: []}.

  A user is considered to be active when

  1) the user has open websocket connection
  2) the user has recent activity

  Active users do not receive mobile and email notifications.

  A user is considered to be online when he is not away and not locked.
  Online users get notified by the `@here` mention.
  """

  alias Stitch.Accounts.ActivityTracker
  alias Stitch.Web.Presence

  def presence_user_ids(team_id) do
    active_user_ids_set =
      team_id
      |> ActivityTracker.active_user_ids()
      |> MapSet.new()

    presence_list = Presence.list("team:lobby:#{team_id}")

    Enum.reduce(presence_list, %{active: [], online: []}, fn {user_id, %{metas: metas}}, acc ->
      active_user_ids =
        if MapSet.member?(active_user_ids_set, user_id) do
          [String.to_integer(user_id) | acc.active]
        else
          acc.active
        end

      online_user_ids =
        if Enum.any?(metas, &(not &1.became_away)) do
          [String.to_integer(user_id) | acc.online]
        else
          acc.online
        end

      %{active: active_user_ids, online: online_user_ids}
    end)
  end

  def new() do
    %{active: [], online: []}
  end
end
