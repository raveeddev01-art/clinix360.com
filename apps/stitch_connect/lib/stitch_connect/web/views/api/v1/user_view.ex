defmodule StitchConnect.Web.Api.V1.UserView do
  use StitchConnect.Web, :view
  alias Stitch.Accounts.User

  def render("index.json", %{users: users}) do
    Enum.map(users, &user_json/1)
  end

  def render("show.json", %{user: user}) do
    user_json(user)
  end

  def render("login.json", %{user: user, redirect_url: redirect_url}) do
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
      team_id: user.team_id,
      whats_new_last_seen_at: user.whats_new_last_seen_at,
      redirect_url: redirect_url
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
      updated_at: user.updated_at,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: "#{user.first_name} #{user.last_name}",
      roles: user.roles,
      email: user.email,
      username: user.username,
      phone: user.phone_number,
      title: user.title,
      is_bot: user.is_bot,
      avatar: avatar(user),
      avatar_thumb: avatar_thumb(user),
      grey_avatar: User.grey_avatar(user),
      onboarded: user.onboarded,
      disabled: user.disabled,
      groups_as_guest: user.groups_as_guest,
      timezone: user.timezone,
      whats_new_last_seen_at: user.whats_new_last_seen_at
    }
  end

  defp avatar(user) do
    if user.is_bot do
      user.profile_image_url
    else
      StitchConnect.PresignedUrlCache.fetch(user.profile_image_url)
    end
  end

  defp avatar_thumb(%{profile_image_thumb_url: nil}), do: nil

  defp avatar_thumb(user) do
    if user.is_bot do
      user.profile_image_thumb_url
    else
      if String.starts_with?(user.profile_image_thumb_url, "https://s3.amazonaws.com") do
        StitchConnect.PresignedUrlCache.fetch(user.profile_image_thumb_url)
      else
        user.profile_image_thumb_url
      end
    end
  end
end
