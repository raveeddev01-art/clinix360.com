defmodule Stitch.Repo.Migrations.AddTypeToFindYourTeamTokens do
  use Ecto.Migration

  # TODO: update existing token, add type "team_list"
  def change do
    alter table(:find_your_team_tokens) do
      add :type, :string, null: false, default: "team_list"
    end
  end
end
