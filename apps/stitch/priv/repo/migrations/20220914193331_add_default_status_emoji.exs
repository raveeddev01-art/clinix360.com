defmodule Stitch.Repo.Migrations.AddDefaultStatusEmoji do
  use Ecto.Migration

  def change do
    alter table(:user_status) do
      modify(:emoji, :string, default: ":speech_balloon:", null: false)
    end
  end
end
