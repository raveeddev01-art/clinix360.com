defmodule Stitch.Import.Slack.GroupImport do
  alias Stitch.Group

  #
  # Expected input:
  #
  #   {
  #     "id": "C00000000",
  #     "name": "general",
  #     "created": "1411111111",
  #     "creator": "U000000000",
  #     "is_archived": false,
  #     "is_general": true,
  #     "members": [
  #         "U00000000",
  #         "U00000001",
  #     ],
  #     "topic": {
  #         "value": "Company-wide announcements and work-based matters",
  #         "creator": "",
  #         "last_set": "0"
  #     },
  #     "purpose": {
  #         "value": "This channel is for team-wide communication and announcements. All team members are in this channel.",
  #         "creator": "",
  #         "last_set": "0"
  #     }
  # }

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

  def get_members(%{"members" => []}) do
  end

  def parse_json(users_mapped_by_slack_import_id, channel_json) do
    # group_name = get_name(channel_json)
    # creator = get_creator(users_mapped_by_slack_import_id, channel_json)
    #
    # group_params = %{
    #   "name" => group_name,
    #   "user_ids" => get_members(channel_json),
    #   "public" => true
    # }
    #
    # group = Group.create(creator, group_params)
  end

  @doc """
  Tries to get the creator, in this order:
  - channel.creator
  - first member in the channel
  - team admin
  Each Slack team has at least one admin.
  """
  def get_creator(users_mapped_by_slack_import_id, channel_json) do
  end
end
