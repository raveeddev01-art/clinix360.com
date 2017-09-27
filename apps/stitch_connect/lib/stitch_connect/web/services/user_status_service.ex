defmodule StitchConnect.Web.UserStatusService do
  alias StitchConnect.Web.Presence

  @doc """
  Returns user ids that has at least one conneciton in active state
  """
  def active_user_ids(team_id) do
    presence_list = Presence.list("team:lobby:#{team_id}")
    Enum.reduce(presence_list, [], fn ({user_id, %{metas: metas}}, acc) ->
      if Enum.any?(metas, & not &1.inactive) do
        [String.to_integer(user_id) | acc]
      else
        acc
      end
    end)
  end
end
