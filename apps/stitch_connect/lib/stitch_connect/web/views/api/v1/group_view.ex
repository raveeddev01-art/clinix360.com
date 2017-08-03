defmodule StitchConnect.Web.Api.V1.GroupView do
  use StitchConnect.Web, :view

  def render("index.json", %{groups: groups}) do
    Enum.map(groups, &group_json/1)
  end

  def group_json(group) do
    %{
      id: group.id,
      name: group.name,
      slug: group.slug,
      public: group.public,
      description: group.description,
      user_count: Enum.count(group.users)
    }
  end
end