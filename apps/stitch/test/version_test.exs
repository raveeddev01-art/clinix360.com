defmodule Stitch.VersionTest do
  use Stitch.DataCase

  describe "Stitch.Version.create/3" do
    test "should infer originator and record type fields" do
      user = insert(:user)
      message = insert(:message)

      {:ok, version} =
        Stitch.Version.insert(message, %{committed_by_id: user.id, source: "application"})

      assert version.source == "application"
      assert version.committed_by_id == user.id
      assert version.record_type == "Message"
      assert version.record_id == message.id
      assert version.record.text_content == message.text_content
      assert version.action == "insert"
    end
  end
end
