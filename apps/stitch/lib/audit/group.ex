defmodule Stitch.Audit.Group do
  def track_insert(group, user) do
    Stitch.Version.insert(group, %{committed_by_id: user.id, source: "application"})
    group
  end

  def track_delete({:ok, %{group: group}} = result, user) do
    Stitch.Version.delete(group, %{committed_by_id: user.id, source: "application"})
    result
  end

  def track_delete(result, _user), do: result
end
