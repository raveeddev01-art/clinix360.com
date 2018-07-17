defmodule Stitch.Repo.Migrations.RenamePublicLinkToPublicToken do
  use Ecto.Migration

  def change do
    rename(table(:uploads), :public_link, to: :public_token)
  end
end
