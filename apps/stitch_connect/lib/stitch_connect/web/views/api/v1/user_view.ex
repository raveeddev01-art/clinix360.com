defmodule StitchConnect.Web.Api.V1.UserView do
  use StitchConnect.Web, :view
  alias Stitch.AWS.S3

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
      grey_avatar: grey_avatar(user),
      onboarded: user.onboarded,
      disabled: user.disabled,
      groups_as_guest: user.groups_as_guest
    }
  end

  defp avatar(user) do
    if user.is_bot do
      user.profile_image_url
    else
      StitchConnect.PresignedUrlCache.fetch(user.profile_image_url)
    end
  end

  defp avatar_thumb(user) do
    if user.is_bot do
      user.profile_image_thumb_url
    else
      StitchConnect.PresignedUrlCache.fetch(user.profile_image_thumb_url)
    end
  end

  defp grey_avatar(user) do
    if has_default_image(user) do
      filepath = String.split(user.profile_image_url, "/") |> List.last()

      # EX.png
      name = String.split(filepath, ".") |> List.first()

      # Turn to EX-grey.png
      grey_avatar_url = String.replace(user.profile_image_url, filepath, "#{name}-grey.png")

      # Fetch a presigned URL for this grey image.
      StitchConnect.PresignedUrlCache.fetch(grey_avatar_url)
    end
  end

  defp has_default_image(user) do
    # Default images look like this: https://s3.amazonaws.com/stitch-content/ST.png
    # We check if the image name length ST.png is equal to 6.
    String.split(user.profile_image_url, "/") |> List.last() |> String.length() == 6
  end
end
