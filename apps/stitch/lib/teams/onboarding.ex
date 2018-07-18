defmodule Stitch.Team.Onboarding do
  @moduledoc """
  The Team Onboarding context.
  """

  alias Ecto.Multi
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
  Returns whether a team slug exists in the Stitch platform.
  """
  def slug_exists?(slug) when byte_size(slug) > 0 and slug not in @blacklisted_subdomains do
    slug = Slugger.slugify_downcase(slug)

    case Repo.get_by(Team, slug: slug) do
      nil ->
        false

      _ ->
        true
    end
  end

  def slug_exists?(_), do: false

  @doc """
  Creates a team with the given name and slug.
  """
  # def create_team(name, slug, tier \\ "FREE")

  def create_team(name, slug, tier \\ "FREE") do
    changeset = Team.changeset(%Team{}, %{name: name, slug: slug})

    Multi.new()
    |> Multi.insert(:team, changeset)
    |> Multi.run(:default_group, fn %{team: team} ->
      Repo.insert(%Group{team_id: team.id, name: "General", slug: "general", is_default: true})
    end)
    |> Multi.run(:default_inbox, fn %{team: team} ->
      Stitch.Engage.Inbox.create_for_team(team.id)
    end)
    |> Repo.transaction()
  end
end
