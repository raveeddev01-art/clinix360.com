defmodule Stitch.Import.Slack.MessageImport do
  import Ecto.Query
  alias Stitch.{Team, TeamQueries, Group, Repo, Message}

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
  #   }
  def import_message(
        team,
        group,
        users_by_slack_import_id,
        groups_by_slack_import_id,
        message_json
      ) do
    if message_json["subtype"] == nil do
      import_text_message(
        team,
        group,
        users_by_slack_import_id,
        groups_by_slack_import_id,
        message_json
      )
    else
      # IO.inspect(message_json["subtype"])
      nil
    end
  end

  def import_text_message(
        _team,
        group,
        users_by_slack_import_id,
        _groups_by_slack_import_id,
        message_json
      ) do
    text = message_json["text"]
    inserted_at = get_datetime(message_json["ts"])
    creator = get_creator(message_json["user"], users_by_slack_import_id)

    if text && inserted_at && creator do
      %Message{
        inserted_at: inserted_at,
        updated_at: inserted_at,
        text_content: text,
        user_id: creator.id,
        group_id: group.id
      }
      |> Repo.insert()
    else
      Logger.error(
        "[#{__MODULE__}] Error creating message for #{inspect([text, inserted_at, creator])}"
      )
    end
  end

  def get_creator(slack_user_id, users_by_slack_import_id) do
    Map.get(users_by_slack_import_id, slack_user_id)
  end

  def get_text(nil), do: nil
  def get_text(""), do: nil

  # TODO: parse mentions
  def get_text(text) do
    text
  end

  def get_datetime(ts) do
    try do
      String.split(ts, ".") |> List.first() |> String.to_integer() |> DateTime.from_unix!()
    rescue
      error ->
        Logger.error("[#{__MODULE__}] Error parsing timestamp #{inspect(error)} #{inspect(ts)}")
        DateTime.utc_now()
    end
  end
end
