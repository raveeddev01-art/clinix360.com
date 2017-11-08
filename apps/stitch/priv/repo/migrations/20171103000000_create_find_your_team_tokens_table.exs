defmodule Stitch.Repo.Migrations.CreateFindYourTeamTokensTable do
  use Ecto.Migration

  def change do
    create table(:find_your_team_tokens) do
      add :email, :string, null: false
      add :token, :string, null: false

      timestamps updated_at: false
    end

    create unique_index(:find_your_team_tokens, :email)
    create unique_index(:find_your_team_tokens, :token)
    create constraint(:find_your_team_tokens, :find_your_team_tokens_email_cant_be_blank, check: "char_length(email) > 0")
    create constraint(:find_your_team_tokens, :find_your_team_tokens_token_cant_be_blank, check: "char_length(token) > 0")
  end
end
