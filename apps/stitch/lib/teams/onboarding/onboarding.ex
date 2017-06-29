defmodule Stitch.Team.Onboarding do
  import Ecto.Changeset
  alias Stitch.{Repo, Team}

  def create_team(user_id, team_params) do
    changeset = Team.changeset(%Team{}, team_params)
    changeset = case changeset do
      %Ecto.Changeset{valid?: true, changes: %{name: name}} ->
        put_change(changeset, :slug, Slugger.slugify_downcase(name))
      _ ->
        changeset
    end

    case Repo.insert(changeset) do
      {:ok, team} ->
        team
      _ ->
        {:error, "Team already exists with this name."}
    end
  end
end