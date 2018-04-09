defmodule Stitch.Repo.Scripts.MigrateUsersToGreyAvatar do
  # mix run apps/stitch/priv/repo/migrate_users_to_grey_avatar.ex
  use Ecto.Migration
  import Ecto.Query
  require Logger

  @disable_ddl_transaction true

  "https://s3.amazonaws.com/stitch-content/ST.png"

  def run do
    users =
      from(
        u in Stitch.Accounts.User,
        where: fragment("char_length(?)", u.profile_image_url) == 46,
        select: u
      )
      |> Stitch.Repo.all()

    Logger.info("Total Users: #{length(users)}")

    Enum.each(users, fn user ->
      Logger.info("Updating image: #{user.email}")

      with {:ok, avatar} <- Stitch.Accounts.ProfileImage.pick_default_random(user),
           {:ok, avatar_thumb} <- Stitch.Accounts.ProfileImage.create_thumb(avatar) do
        Logger.info("profile_image_url: #{avatar}")
        Logger.info("profile_image_thumb_url: #{avatar_thumb}")

        Stitch.Repo.update(
          Ecto.Changeset.change(
            user,
            profile_image_url: avatar,
            profile_image_thumb_url: avatar_thumb
          )
        )
      else
        error ->
          Logger.error("Could not set avatar for user: #{user.email} - No first or last name.")
      end
    end)
  end
end

Stitch.Repo.Scripts.MigrateUsersToGreyAvatar.run()
