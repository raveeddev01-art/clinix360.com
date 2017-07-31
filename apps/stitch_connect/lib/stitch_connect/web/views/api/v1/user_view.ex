defmodule StitchConnect.Web.Api.V1.UserView do
  use StitchConnect.Web, :view

  def render("index.json", %{users: users}) do
    Enum.map(users, &user_json/1)
  end

  def user_json(user) do
    %{
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      username: user.username
    }
  end

  def render("show.json", %{user: user}) do
    %{
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone_number,
      title: user.title,
      avatar: user.profile_image_url
    }
  end
end
