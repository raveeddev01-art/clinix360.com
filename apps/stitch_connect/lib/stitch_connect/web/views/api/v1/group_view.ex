defmodule StitchConnect.Web.Api.V1.GroupView do
  use StitchConnect.Web, :view
  alias StitchConnect.Web.Api.V1.UserView
  alias Stitch.Group

  def render("index.json", %{groups: groups, user_id: user_id}) do
    Enum.map(groups, fn group ->
      group_json(group, user_id)
    end)
  end

  def render("show.json", %{group: group, user_id: user_id}) do
    group_json(group, user_id)
  end

  def group_json(group, user_id) do
    %{
      id: group.id,
      name: group_name(group, user_id),
      slug: group.slug,
      public: group.public,
      favorite: group.favorite,
      description: group.description,
      is_default: group.is_default,
      joined: group.joined,
      users: Enum.map(group.users, &UserView.user_json/1),
      type: type(group),
      user_count: Enum.count(group.users),
      unread_messages_count: group.unread_messages_count,
      mentions_count: group.mentions_count,
      last_read_at: group.last_read_at,
      inserted_at: group.inserted_at,
      creator_user_id: group.creator_user_id,
    }
  end

  defp group_name(%Group{name: "__dm_group__", users: users}, user_id) do
    user = case users do
      [me] -> me
      users -> Enum.find(users, &( &1.id != user_id ))
    end

    "#{user.first_name} #{user.last_name}"
  end

  defp group_name(%Group{name: "__multi_dm_group__", users: users}, user_id) do
    users |> Enum.filter(& &1.id != user_id ) |> Enum.map(& &1.first_name ) |> Enum.join(", ")
  end

  defp group_name(%Group{name: name}, _), do: name

  defp type(%Group{name: "__dm_group__"}), do: :dm
  defp type(%Group{name: "__multi_dm_group__"}), do: :multi_dm
  defp type(_), do: :regular
end
