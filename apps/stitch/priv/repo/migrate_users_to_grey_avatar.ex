defmodule Stitch.Repo.Scripts.MigrateUsersToGreyAvatar do
  # mix run apps/stitch/priv/repo/migrate_users_to_grey_avatar.ex
  use Ecto.Migration
  import Ecto.Query
  require Logger

  @disable_ddl_transaction true

  def run do
    query =
      from(
        u in Stitch.Accounts.User,
        where: fragment("char_length(?)", u.profile_image_url) == 46
      )

    Stitch.ChunkStream.chunk(query, 50)
    |> Stream.each(&update_image_for_users/1)
    |> Stream.run()
  end

  defp update_image_for_users(users) do
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
