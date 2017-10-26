defmodule Stitch.ExportsTest do
  use Stitch.DataCase
  alias Stitch.Exports

  test "create_export/1" do
    team = insert(:team)
    result = Exports.create_export(team)
    assert {:ok, export} = result
    assert export.team_id == team.id
    assert export.status == "PROCESSING"
  end

  test "update_export/2" do
    export = insert(:export)
    assert export.status == "PROCESSING"
    refute export.zip_url
    params = %{status: "COMPLETE", zip_url: "some_url"}

    result = Exports.update_export(export, params)

    assert {:ok, export} = result
    assert export.status == "COMPLETE"
    assert export.zip_url == "some_url"
  end

  describe "list_exports/1" do
    test "returns all exports for a given team" do
      team_1   = insert(:team)
      team_2   = insert(:team)
      export_1 = insert(:export, team: team_1)
      export_2 = insert(:export, team: team_1)
      export_3 = insert(:export, team: team_2)

      results = Exports.list_exports(team_1)

      result_ids = Enum.map(results, &(&1.id))
      assert export_1.id in result_ids
      assert export_2.id in result_ids
      refute export_3.id in result_ids
    end

    test "returns an empty list if no exports are found" do
      team = insert(:team)
      assert Exports.list_exports(team) == []
    end
  end

  describe "get_export/2" do
    test "returns export with valid export id and team_id" do
      team   = insert(:team)
      export = insert(:export, team: team)

      result = Exports.get_export(id: export.id, team_id: team.id)

      assert result.id == export.id
    end

    test "returns nil with invalid team id" do
      team_1   = insert(:team)
      team_2   = insert(:team)
      export = insert(:export, team: team_1)

      refute Exports.get_export(id: export.id, team_id: team_2.id)
    end
  end

  describe "authorized_to_create_export?/1" do
    test "returns true with team with 0 exports" do
      team_1 = insert(:team)
      team_2 = insert(:team)
      _export = insert(:export, team: team_2)
      assert Exports.authorized_to_create_export?(team_1)
    end

    test "returns false with a team with export created ten hours ago" do
      team = insert(:team)
      now = NaiveDateTime.utc_now()
      ten_hours_ago = NaiveDateTime.add(now, -36_000, :second)
      insert(:export, team: team, inserted_at: ten_hours_ago)

      refute Exports.authorized_to_create_export?(team)
    end

    test "returns true with a team with export created 36 hours ago" do
      team_1 = insert(:team)
      team_2 = insert(:team)
      now = NaiveDateTime.utc_now()
      thirty_six_hours_ago = NaiveDateTime.add(now, -129_600, :second)
      insert(:export, team: team_1, inserted_at: thirty_six_hours_ago)
      insert(:export, team: team_2)

      assert Exports.authorized_to_create_export?(team_1)
    end
  end

end
