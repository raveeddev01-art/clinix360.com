defmodule Stitch.Repo.Migrations.SetProfileImageToHistoricalNull do
  use Ecto.Migration

  @default_avatar Stitch.Accounts.ProfileImage.pick_default_random()

  def up do
    execute(~s(UPDATE users SET
      profile_image_url = '#{@default_avatar.image_url}',
      profile_image_thumb_url = '#{@default_avatar.thumb_url}'
      WHERE profile_image_url is null))
  end

  def down do
  end
end