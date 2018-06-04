defmodule Stitch.Repo.Scripts.MigrateAvatarThumbsToCloudFront do
  # mix run apps/stitch/priv/repo/migrate_avatar_thumbs_to_cloudfront.ex

  require Logger
  alias Stitch.{Repo}

  def run do
    Stitch.Accounts.User
    |> Stitch.ChunkStream.chunk(50)
    |> Stream.each(&migrat_avatar_thumb_to_cloudfront/1)
    |> Stream.run()
  end

  defp migrat_avatar_thumb_to_cloudfront(users) do
    Enum.each(users, fn user ->
      if user.profile_image_thumb_url do
        Logger.info("Migrating avatar thumb for user_id #{user.id}")

        case Stitch.Accounts.ProfileImage.create_thumb(user.profile_image_url) do
          {:ok, profile_image_thumb_url} ->
            user
            |> Ecto.Changeset.change(profile_image_thumb_url: profile_image_thumb_url)
            |> Repo.update()

          {:error, error} ->
            Logger.error("Error migrating avatar for user #{user.id}: #{inspect(error)}")
        end
      end
    end)
  end
end

Stitch.Repo.Scripts.MigrateAvatarThumbsToCloudFront.run()
