defmodule :"Elixir.Stitch.Repo.Migrations.Migrate-users-to-initials-based-avatars" do
  use Ecto.Migration
  require Logger

  def change do
    users =
      from(
        u in Stitch.Accounts.User,
        where(
          [u],
          is_nil(u.profile_image_url) or
            u.profile_image_url == "https://s3.amazonaws.com//default-avatar.png"
        )
      )

    Logger.info("Total Users: #{length(users)}")
    i = 0
    total_users = length(users)

    Enum.each(users, fn user ->
      {:ok, avatar} = Stitch.Accounts.ProfileImage.pick_default_random(user)
      {:ok, avatar_thumb} = Stitch.Accounts.ProfileImage.create_thumb(avatar)

      Repo.update(
        Ecto.Changeset.change(
          user,
          profile_image_url: avatar,
          profile_image_thumb_url: avatar_thumb
        )
      )
      i += 1
      Logger.info("Updated avatar [#{i}/#{total_users}]: #{user.email} - #{avatar} - #{avatar_thumb}")
    end)
  end
end