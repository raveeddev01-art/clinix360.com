defmodule Stitch.AccessLogTest do
  use Stitch.DataCase, async: true
  alias Stitch.Accounts.AccessLog
  alias Stitch.Repo

  describe "Accounts.create_or_update/4" do
    test "it creates an access log record" do
      user = insert(:user)
      {:ok, access_log} = AccessLog.create_or_update(user, "127.0.0.1", "user-agent-1")
      assert %{access_count: 1} = Repo.get(AccessLog, access_log.id)

      {:ok, access_log} = AccessLog.create_or_update(user, "127.0.0.2", "user-agent-1")
      assert %{access_count: 1} = Repo.get(AccessLog, access_log.id)
    end

    test "it increments access count for record with the exisitng user_id, ip, user-agent combination" do
      user = insert(:user)
      {:ok, _access_log} = AccessLog.create_or_update(user, "127.0.0.1", "user-agent-1")
      {:ok, _access_log} = AccessLog.create_or_update(user, "127.0.0.1", "user-agent-1")
      assert [%{access_count: 2}] = Repo.all(AccessLog)
    end
  end
end
