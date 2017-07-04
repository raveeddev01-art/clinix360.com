defmodule Stitch.TeamQueriesTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.TeamQueries.get_by_slug/1" do
    test "finds a team given a slug string" do
      insert(:team, %{name: "Example", slug: "example"})
      team = Stitch.TeamQueries.get_by_slug("example")
      assert team.name == "Example"
      assert team.slug == "example"
    end

    test "returns nil if empty slug is passed" do
      team = Stitch.TeamQueries.get_by_slug("")
      assert team == nil
    end
  end
end