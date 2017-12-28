defmodule Stitch.Repo.Migrations.AddRequestIdToMessages do
  use Ecto.Migration

  def change do
    alter table(:messages) do
      add :request_id, :string
    end
  end
end
