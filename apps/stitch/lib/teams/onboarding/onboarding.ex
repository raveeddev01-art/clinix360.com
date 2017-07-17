defmodule Stitch.Team.Onboarding do
  @moduledoc """
  Onboarding module used to onboard new teams to the Stitch
  platform.
  """

  alias Stitch.{Repo, Team, Room}

  def slug_available?(slug) when byte_size(slug) > 0 do
    slug = Slugger.slugify(slug)
    case Repo.get_by(Team, slug: slug) do
      nil ->
        true
      team ->
        false
    end
  end
  def slug_available?(_), do: false

  def create_team(name, slug) when byte_size(name) > 0 and byte_size(slug) > 0 do
    slug = Slugger.slugify(slug)
    changeset = Team.changeset(%Team{}, %{name: name, slug: slug})
    case Repo.insert(changeset) do
      {:ok, team} ->
        Repo.insert(%Room{team_id: team.id, name: "General"})
        team
      {:error, changeset} ->
        {:error, "Team wasn't created"}
    end
  end
end
