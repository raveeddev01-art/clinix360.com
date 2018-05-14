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
        groups_by_slack_import_id,
        message_json
      ) do
    text = message_json["text"]
    inserted_at = get_datetime(message_json["ts"])
    creator = get_creator(message_json["user"], users_by_slack_import_id)
    text_content = get_text(text, groups_by_slack_import_id, users_by_slack_import_id)

    mentioned_user_id =
      Stitch.Message.Mention.get_mentioned_user_ids(
        Repo.preload(group, :users).users,
        creator,
        text_content,
        [],
        group
      )

    if text && inserted_at && creator do
      %Message{
        inserted_at: inserted_at,
        updated_at: inserted_at,
        text_content: text_content,
        mentioned_user_ids: mentioned_user_id,
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

  def get_text(nil, _groups_by_slack_import_id, _users_by_slack_import_id), do: nil
  def get_text("", _groups_by_slack_import_id, _users_by_slack_import_id), do: nil

  @doc """
  Translates Slack mentions to Stitch mentions.
  """
  def get_text(text, groups_by_slack_import_id, users_by_slack_import_id) do
    Regex.replace(~r/\<([^>]+)\>/, text, fn
      "<!here>", _ ->
        "<@Ghere>"

      "<!channel>", _ ->
        "<@Groom>"

      "<!everyone>", _ ->
        "<@Groom>"

      "<#C" <> _ = full_text, "#" <> slack_channel_id ->
        slack_channel_id = slack_channel_id |> String.split("|") |> List.first()

        case Map.fetch(groups_by_slack_import_id, slack_channel_id) do
          {:ok, group} ->
            "<@G#{group.id}>"

          :error ->
            full_text
        end

      "<@U" <> _ = full_text, "@" <> slack_user_id ->
        case Map.fetch(users_by_slack_import_id, slack_user_id) do
          {:ok, user} ->
            "<@U#{user.id}>"

          :error ->
            full_text
        end

      _full_text, "https://" <> _ = url ->
        url |> String.split("|") |> List.first()

      _full_text, "http://" <> _ = url ->
        url |> String.split("|") |> List.first()

      full_text, _captured ->
        full_text
    end)
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
