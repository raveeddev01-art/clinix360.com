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
end
