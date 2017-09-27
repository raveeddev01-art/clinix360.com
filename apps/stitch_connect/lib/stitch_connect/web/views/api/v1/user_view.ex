defmodule StitchConnect.Web.Api.V1.UserView do
  use StitchConnect.Web, :view

  def render("index.json", %{users: users}) do
    Enum.map(users, &user_json/1)
  end

  def render("show.json", %{user: user}) do
    user_json(user)
  end

  def render("login.json", %{user: user}) do
    %{
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      roles: user.roles,
      email: user.email,
      username: user.username,
      phone: user.phone_number,
      title: user.title,
      avatar: user.profile_image_url,
      onboarded: user.onboarded,
      disabled: user.disabled,
      token: user.token,
      pin: user.pin,
      team_id: user.team_id
    }
  end

  def render("update.json", %{user: user}) do
    %{
       id: user.id,
       first_name: user.first_name,
       last_name: user.last_name,
       phone_number: user.phone_number,
       title: user.title,
       profile_image_url: user.profile_image_url,
       user_name: user.username,
       email: user.email,
       pin: user.pin
      }
  end

  def user_json(user) do
    %{
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      roles: user.roles,
      email: user.email,
      username: user.username,
      phone: user.phone_number,
      title: user.title,
      avatar: user.profile_image_url,
      onboarded: user.onboarded,
      disabled: user.disabled
    }
  end
end
