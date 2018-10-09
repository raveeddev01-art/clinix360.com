defmodule Stitch.Exports.HistoryHelper do
  def get_group_name(group) do
    if String.starts_with?(group.group_name, "__dm") do
      group_with_users =
        %{%Stitch.Group{} | id: group.group_id, name: group.group_name}
        |> Stitch.Repo.preload(:users)

      name =
        group_with_users.users
        |> Enum.sort(&(&1.id <= &2.id))
        |> Enum.map_join(" ", &"#{&1.first_name} #{&1.last_name}")
        |> String.replace(~r/(\,|\s)/, "-")

      "DM-#{group.group_id}-" <> name
    else
      group.group_name
    end
  end
end
