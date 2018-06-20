defmodule Stitch.Files.FileAuthorizationTest do
  use Stitch.DataCase, async: true

  alias Stitch.{
    Files.FileAuthorization,
    Files.FileQueries
  }

  describe "Stitch.Files.FileAuthorization.can_view?/2" do
    test "return true if the user is a member of the group where the file is shared" do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)
      insert(:group_user, user: user, group: group)
      upload = insert(:upload, team: team)
      insert(:group_upload, upload: upload, group: group)

      upload = FileQueries.get_by_id(upload.id, preload_assoc: true)
      assert FileAuthorization.can_view?(upload, user) == true
    end

    test "return true if the user uploaded the file" do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)
      insert(:group_user, user: user, group: group)
      upload = insert(:upload, team: team, user: user)

      upload = FileQueries.get_by_id(upload.id, preload_assoc: true)
      assert FileAuthorization.can_view?(upload, user) == true
    end

    test "return false if the file is private and the user is not a member of any group where the file is shared" do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)
      upload = insert(:upload, team: team, public: false)
      insert(:group_upload, upload: upload, group: group)

      upload = FileQueries.get_by_id(upload.id, preload_assoc: true)
      assert FileAuthorization.can_view?(upload, user) == false
    end
  end
end
