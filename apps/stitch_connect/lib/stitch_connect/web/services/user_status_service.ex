defmodule StitchConnect.Web.UserStatusService do
  alias StitchConnect.Web.Presence

  @doc """
  Returns user ids that has at least one conneciton in active state
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
        if Enum.any?(metas, & not &1.away) do
          [String.to_integer(user_id) | acc.online]
        else
          acc.online
        end

      %{active: active_user_ids, online: online_user_ids}
    end)
  end
end
