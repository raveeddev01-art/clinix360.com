defmodule Stitch.Repo.Migrations.AddDesktopSoundSettingToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add(:desktop_sound_setting, :string)
    end
  end
end
