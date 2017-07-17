defmodule StitchConnect.Web.Api.V1.UserView do
  use StitchConnect.Web, :view

  def render("index.json", %{users: users}) do
    Enum.map(users, &user_json/1)
  end

  def user_json(user) do
    %{
      id: user.id,
      fullname: user.fullname
    }
  end
end
