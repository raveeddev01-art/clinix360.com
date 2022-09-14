defmodule Stitch.Web.Api.V1.UserView do
  use Stitch.Web, :view
  alias Stitch.Accounts.User

  def render("status.json", %{status: nil}) do
    %{
      message: "No active status found for the user."
    }
  end

  def render("status.json", %{status: status}) do
    status_json(status)
  end

  def render("status_history.json", %{status_history: history}) do
    Enum.map(history, &status_json/1)
  end

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
      whats_new_last_seen_at: user.whats_new_last_seen_at,
      status: user.status_fields
    }
  end

  def status_json(status) do
    %{
      id: status.id,
      text: status.text,
      user_id: status.user_id,
      emoji: status.emoji,
      expiring_time: status.expiring_time,
      active: status.active
    }
  end

  defp avatar(user) do
    if user.is_bot do
      user.profile_image_url
    else
      Stitch.PresignedUrlCache.fetch(user.profile_image_url)
    end
  end

  def avatar_thumb(%{profile_image_thumb_url: nil}), do: nil

  def avatar_thumb(user) do
    if user.is_bot do
      user.profile_image_thumb_url
    else
      if String.starts_with?(user.profile_image_thumb_url, "https://s3.amazonaws.com") do
        Stitch.PresignedUrlCache.fetch(user.profile_image_thumb_url)
      else
        user.profile_image_thumb_url
      end
    end
  end
end
