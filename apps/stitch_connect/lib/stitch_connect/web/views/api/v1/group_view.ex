defmodule StitchConnect.Web.Api.V1.GroupView do
  use StitchConnect.Web, :view
  alias StitchConnect.Web.Api.V1.UserView

  def render("index.json", %{groups: groups}) do
    Enum.map(groups, &group_json/1)
  end

  def render("show.json", %{group: group}) do
    group_json(group)
  end

  def group_json(group) do
    %{
      id: group.id,
      name: group.name,
      slug: group.slug,
      public: group.public,
      favorite: group.favorite,
      description: group.description,
      joined: group.joined,
      users: Enum.map(group.users, &UserView.user_json/1),
      user_count: Enum.count(group.users),
      unread_messages_count: group.unread_messages_count,
      mentions_count: group.mentions_count,
    }
  end
end
