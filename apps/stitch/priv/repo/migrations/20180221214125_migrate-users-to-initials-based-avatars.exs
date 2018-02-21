defmodule :"Elixir.Stitch.Repo.Migrations.Migrate-users-to-initials-based-avatars" do
  use Ecto.Migration
  import Ecto.Query
  require Logger

  def change do
    users =
      from(
        u in Stitch.Accounts.User,
        where:
          is_nil(u.profile_image_url) or
            u.profile_image_url == "https://s3.amazonaws.com/stitch-content/default-avatar.png",
        select: u
      )
      |> Stitch.Repo.all()

    Logger.info("Total Users: #{length(users)}")
    i = 0
    total_users = length(users)

    Enum.each(users, fn user ->
      with {:ok, avatar} <- Stitch.Accounts.ProfileImage.pick_default_random(user),
           {:ok, avatar_thumb} <- Stitch.Accounts.ProfileImage.create_thumb(avatar) do
        Repo.update(
          Ecto.Changeset.change(
            user,
            profile_image_url: avatar,
            profile_image_thumb_url: avatar_thumb
          )
        )

        i = i + 1

        Logger.info(
          "Updated avatar [#{i}/#{total_users}]: #{user.email} - #{avatar} - #{avatar_thumb}"
        )
      else
        error ->
          Logger.error("Could not set avatar for user: #{user.email} - Not first or last name.")
      end
    end)
  end
end