defmodule StitchConnect.Web.Api.V1.GroupView do
  use StitchConnect.Web, :view
  alias StitchConnect.Web.Api.V1.UserView
  alias Stitch.Group

  def render("index.json", %{groups: groups, user_id: user_id} = attrs) do
    fetch_users = Map.get(attrs, :fetch_users, true)
    Enum.map(groups, fn group ->
      json = group_json(group, user_id, fetch_users)
      if fetch_users do
        Map.merge(json, %{
          users: Enum.map(group.users, &UserView.user_json/1),
          user_count: Enum.count(group.users),
        })
      else
        json
      end
    end)
  end

  def render("show.json", %{group: group, user_id: user_id} = attrs) do
    fetch_users = Map.get(attrs, :fetch_users, true)
    if fetch_users do
      json = group_json(group, user_id)
      Map.merge(json, %{
        users: Enum.map(group.users, &UserView.user_json/1),
        user_count: Enum.count(group.users),
      })
    else
      %{
        id: group.id,
        user_ids: group.user_ids,
      }
    end
  end

  def group_json(group, user_id, fetch_users \\ true) do
    name = if fetch_users, do: group_name(group, user_id), else: group.name
    %{
      id: group.id,
      name: name,
      slug: group.slug,
      public: group.public,
      description: group.description,
      is_default: group.is_default,
      is_hidden: group.is_hidden,
      is_favorite: group.is_favorite,
      joined: group.joined,
      type: type(group),
      unread_messages_count: group.unread_messages_count,
      mentions_count: group.mentions_count,
      last_read_at: group.last_read_at,
      inserted_at: group.inserted_at,
      updated_at: group.updated_at,
      creator_user_id: group.creator_user_id
    }
  end

  defp group_name(%Group{name: "__dm_group__", users: users}, user_id) do
    user =
      case users do
        [me] -> me
        users -> Enum.find(users, &(&1.id != user_id))
      end
    "#{user.first_name} #{user.last_name}"
  end

  defp group_name(%Group{name: "__multi_dm_group__", users: users}, user_id) do
    users
    |> Enum.filter(&(&1.id != user_id))
    |> Enum.sort(&(&1.id <= &2.id))
    |> Enum.map(&"#{&1.first_name} #{&1.last_name}")
    |> Enum.join(", ")
  end

  defp group_name(%Group{name: name}, _), do: name

  defp type(%Group{name: "__dm_group__"}), do: :dm
  defp type(%Group{name: "__multi_dm_group__"}), do: :multi_dm
  defp type(_), do: :regular
end