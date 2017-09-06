defmodule StitchConnect.Web.UserStatusService do
  alias StitchConnect.Web.Presence

  @doc """
  Returns user ids that have active sessions in which they are online and have the given group open
  """
  def online_in_group(team_id, group_slug) do
    presence_list = Presence.list("team:lobby:#{team_id}")
    Enum.reduce(presence_list, [], fn ({user_id, %{metas: metas}}, acc) ->
      if Enum.any?(metas, & (Map.has_key?(&1, :current_group) && (&1.current_group == group_slug)) and &1.status == "online") do
        [String.to_integer(user_id) | acc]
      else
        acc
      end
    end)
  end
end
