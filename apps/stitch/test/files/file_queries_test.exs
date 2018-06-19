defmodule Stitch.FileQueriesTest do
  use Stitch.DataCase, async: true

  alias Stitch.{
    Files.FileQueries
  }

  describe "FileQueries.get_by_id/2" do
    setup do
      team = insert(:team)
      group_a = insert(:group)
      group_b = insert(:group)
      upload = insert(:upload, team: team)
      insert(:group_upload, upload: upload, group: group_a)
      insert(:group_upload, upload: upload, group: group_b)
      {:ok, upload: upload, group_a: group_a, group_b: group_b}
    end

    test "includes shared_in", %{upload: upload, group_a: group_a, group_b: group_b} do
      upload = FileQueries.get_by_id(upload.id, preload_assoc: true)
      assert Enum.sort(upload.shared_in) == Enum.sort([group_a.id, group_b.id])
    end
  end
end
