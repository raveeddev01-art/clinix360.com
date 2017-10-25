defmodule Stitch.Team.Onboarding do
  @moduledoc """
  The Team Onboarding context.
  """

  alias Stitch.{Repo, Team, Group}
  @blacklisted_subdomains Stitch.Blacklist.blacklisted_subdomains()

  @doc """
  Returns whether a team slug is unused and available for use within
  the Stitch platform.
  """
  def slug_available?(slug) when byte_size(slug) > 0 and slug not in @blacklisted_subdomains do
    slug = Slugger.slugify_downcase(slug)
    case Repo.get_by(Team, slug: slug) do
      nil ->
        true
      _ ->
        false
    end
  end
  def slug_available?(_), do: false

  @doc """
  Creates a team with the given name and slug.
  """
  def create_team(name, slug) when byte_size(name) > 0 and byte_size(slug) > 0 do
    slug = Slugger.slugify_downcase(slug)
    changeset = Team.changeset(%Team{}, %{name: name, slug: slug})
    case Repo.insert(changeset) do
      {:ok, team} ->
        Repo.insert(%Group{team_id: team.id, name: "General", slug: "general", is_default: true})
        Stitch.Billing.setup_new_team(team)
        team
      {:error, _} ->
        {:error, "Team wasn't created"}
    end
  end
end
