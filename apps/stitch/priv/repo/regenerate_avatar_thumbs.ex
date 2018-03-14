defmodule Stitch.Repo.Scripts.RegenerateAvatarThumbs do
  # mix run apps/stitch/priv/repo/regenerate_avatar_thumbs.ex
  use Ecto.Migration

  @disable_ddl_transaction true

  alias Stitch.{Repo}
  alias Stitch.Accounts
  alias Stitch.Accounts.User

  def run do
    Repo.transaction(
      fn ->
        User
        |> Repo.stream()
        |> Stream.each(fn user ->
          try do
            if user.profile_image_url == nil do
              # Set default avatar for migrated users
              Accounts.delete_profile_image(user.id)
            else
              case Stitch.Accounts.ProfileImage.create_thumb(user.profile_image_url) do
                {:ok, profile_image_thumb_url} ->
                  user
                  |> Ecto.Changeset.change(profile_image_thumb_url: profile_image_thumb_url)
                  |> Repo.update()

                {:error, error} ->
                  IO.inspect(error)
              end
            end
          rescue
            error ->
              IO.inspect(error)
              IO.inspect(user)
          end
        end)
        |> Stream.run()
      end,
      timeout: :infinity
    )
  end
end

Stitch.Repo.Scripts.RegenerateAvatarThumbs.run()
