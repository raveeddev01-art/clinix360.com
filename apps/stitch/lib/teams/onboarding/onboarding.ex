defmodule Stitch.Team.Onboarding do
  import Ecto.Changeset
  alias Stitch.{Repo, Team, TeamUser}

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
        team_user_changeset = TeamUser.changeset(%TeamUser{}, %{role: "admin", user_id: user_id, team_id: team.id})
        Repo.insert(team_user_changeset)
        team
      _ ->
        {:error, "Team already exists with this name."}
    end
  end

  def name_available?(name) do
    slug = Slugger.slugify_downcase(name)
    case Repo.get_by(Team, slug: slug) do
      nil ->
        true
      _ ->
        false
    end
  end
end