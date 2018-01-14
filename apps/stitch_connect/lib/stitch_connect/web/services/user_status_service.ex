defmodule StitchConnect.Web.UserStatusService do
  alias StitchConnect.Web.Presence

  @doc """
  Returns user status info in the format: {active: [], online: []}.

  A user is considered to be active when

  1) his chat is not in the background
  2) had recent activity (mouse movement / keyboard presses) which is determined by the client side
  2) is not locked

  Active users do not receive mobile and email notifications.

  A user is considered to be online when he is not away and not locked.
  Online users get notified by the `@here` mention.
  """
  def presence_user_ids(team_id) do
    presence_list = Presence.list("team:lobby:#{team_id}")
    Enum.reduce(presence_list, %{active: [], online: []}, fn ({user_id, %{metas: metas}}, acc) ->

      active_user_ids =
        if Enum.any?(metas, & not &1.inactive) do
          [String.to_integer(user_id) | acc.active]
        else
          acc.active
        end

      online_user_ids =
        if Enum.any?(metas, & not &1.became_away) do
          [String.to_integer(user_id) | acc.online]
        else
          acc.online
        end

      %{active: active_user_ids, online: online_user_ids}
    end)
  end
end
