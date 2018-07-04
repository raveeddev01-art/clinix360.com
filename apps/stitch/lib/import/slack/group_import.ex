defmodule Stitch.Import.Slack.GroupImport do
  require Logger
  alias Stitch.{Repo, Group}

  @doc """
  Expected input:

      {
        "id": "C00000000",
        "name": "general",
        "created": "1411111111",
        "creator": "U000000000",
        "is_archived": false,
        "is_general": true,
        "members": [
            "U00000000",
            "U00000001",
        ],
        "topic": {
            "value": "Company-wide announcements and work-based matters",
            "creator": "",
            "last_set": "0"
        },
        "purpose": {
            "value": "This channel is for team-wide communication and announcements. All team members are in this channel.",
            "creator": "",
            "last_set": "0"
        }
      }
  """
  def parse_json(team, _users_by_slack_import_id, %{"is_archived" => true} = channel_json) do
    IO.puts(
      "Skipping archived channel: #{inspect(%{team_id: team.id, name: channel_json["name"]})}"
    )
  end

  def parse_json(team, users_by_slack_import_id, channel_json) do
    members = get_members(channel_json, users_by_slack_import_id)

    group_name = get_name(channel_json)
    group_slug = Slugger.slugify_downcase(group_name)
    creator = get_creator(users_by_slack_import_id, channel_json, members)
    description = get_description(channel_json)

    group_params = %{
      "name" => group_name,
      "slug" => group_slug,
      "user_ids" => Enum.map(members, & &1.id),
      "public" => true,
      "description" => description
    }

    if Repo.get_by(Group, slug: group_slug, team_id: team.id) do
      IO.puts("Skipping existing group: #{inspect(%{team_id: team.id, slug: group_slug})}")
    else
      creator
      |> Group.create(group_params)
      |> log_if_error(channel_json)
      |> assign_slack_import_id(channel_json["id"])
      |> assign_is_default(channel_json["is_general"])
    end
  end

  def get_description(channel_json) do
    topic = get_in(channel_json, ["topic", "value"])
    purpose = get_in(channel_json, ["purpose", "value"])

    [topic, purpose]
    |> Enum.filter(&(&1 != nil))
    |> Enum.join(" ")
  end

  # Must conform to:
  # |> validate_length(:name, max: 25)
  # |> validate_format(:name, ~r/^[\w-\s]+$/)
  def get_name(%{"name" => name}) do
    name =
      name
      |> String.trim()
      |> String.replace(~r/[^\w-\s]/, "")
      |> String.slice(0..24)

    if name == "" do
      Stitch.Rand.token(8)
    else
      name
    end
  end

  def get_members(%{"members" => members}, users_by_slack_import_id) do
    members
    |> Enum.reduce([], fn slack_user_id, acc ->
      case Map.fetch(users_by_slack_import_id, slack_user_id) do
        {:ok, user} ->
          [user | acc]

        :error ->
          acc
      end
    end)
  end

  def assign_slack_import_id({:ok, group}, slack_import_id) do
    group
    |> Ecto.Changeset.change(slack_import_id: slack_import_id)
    |> Repo.update()
  end

  def assign_slack_import_id({:error, _} = result, _slack_import_id), do: result

  def assign_is_default({:ok, group}, true) do
    group
    |> Ecto.Changeset.change(is_default: true)
    |> Repo.update()
  end

  def assign_is_default(result, _is_default), do: result

  @doc """
  Tries to get the creator, in this order:
  - channel.creator
  - first member in the channel
  - team admin
  Each Slack team has at least one admin.
  """
  def get_creator(users_by_slack_import_id, channel_json, members) do
    get_channel_creator(users_by_slack_import_id, channel_json) || List.first(members) ||
      get_team_admin(users_by_slack_import_id)
  end

  def get_channel_creator(users_by_slack_import_id, channel_json) do
    with {:ok, slack_user_id} <- Map.fetch(channel_json, "creator"),
         {:ok, user} <- Map.fetch(users_by_slack_import_id, slack_user_id) do
      user
    else
      _ -> nil
    end
  end

  def get_team_admin(users_by_slack_import_id) do
    users_by_slack_import_id
    |> Map.values()
    |> Enum.find(fn user -> user.roles == ["admin"] end)
  end

  def log_if_error({:ok, _user} = result, _channel_json), do: result

  def log_if_error({:error, error} = result, channel_json) do
    Logger.error("[#{__MODULE__}] #{inspect(error)} #{inspect(channel_json)}")
    result
  end
end
