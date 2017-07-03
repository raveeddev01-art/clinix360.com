defmodule Stitch.Team.Onboarding do
  @moduledoc """
  Onboarding module used to onboard new teams to the Stitch
  platform.
  """

  alias Stitch.{Repo, Team}

  def name_available?(name) when byte_size(name) > 0 do
    slug = Slugger.slugify_downcase(name)
    case Repo.get_by(Team, slug: slug) do
      nil ->
        true
      team ->
        false
    end
  end
  def name_available?(_), do: false

  def create_team(name) when byte_size(name) > 0 do
    slug = Slugger.slugify_downcase(name)
    changeset = Team.changeset(%Team{}, %{name: name, slug: slug})
    case Repo.insert(changeset) do
      {:ok, team} ->
        team
      {:error, changeset} ->
        {:error, "Team wasn't created"}
    end
  end
end
