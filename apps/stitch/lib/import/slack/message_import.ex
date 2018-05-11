defmodule Stitch.Import.Slack.MessageImport do
  import Ecto.Query
  alias Stitch.{Team, TeamQueries, Group, Repo}

  require Logger

  #   {
  #     "type": "message",
  #     "subtype": "file_share",
  #     "text": "",
  #     "file": {
  #     },
  #     "user": "U0000001",
  #     "upload": true,
  #     "display_as_bot": false,
  #     "username": "username",
  #     "bot_id": null,
  #     "ts": "1424013078.000001"
  # },
  def import_message(team, users_by_slack_import_id, groups_by_slack_import_id, message_json) do
    nil
  end
end
