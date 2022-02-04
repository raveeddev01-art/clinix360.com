defmodule Stitch.Import.Slack do
  alias Stitch.Repo
  import Ecto.Query

  import Logger

  # alias Stitch.{Accounts.User, Team, TeamQueries, Group, GroupUser, Message}

  @team_name System.get_env("TEAM_NAME")
  @zip_url System.get_env("ZIP_URL")

  def download_and_unzip do
    # Download zip file
    IO.puts("Downloading zip: #{@zip_url}")
    %HTTPoison.Response{body: body} = HTTPoison.get!(@zip_url)

    # Write binary to path in tmp
    zip_path = "/tmp/#{@team_name}-slack-export.zip"
    IO.puts("Writing zip file to: #{zip_path}")
    File.write!(zip_path, body)

    # Extract content to folder.
    unzip_path = "/tmp/#{@team_name}-slack-export-contents/"
    IO.puts("Extracting contents to: #{unzip_path}")
    {:ok, _file_list} = :zip.unzip(String.to_charlist(zip_path), cwd: unzip_path)
    {:ok, unzip_path}
  end

  def parse_groups(path) do
    # We're only interested in folders, each folder represents
    # a group within the team.
    groups =
      File.ls!(path)
      |> Enum.filter(&File.dir?(Path.join(path, &1)))

    IO.puts("Found these groups:")
    {:ok, groups}
  end

  def import_users(team, path) do
    Path.join(path, "users.json")
    |> File.read!()
    |> Poison.decode!()
    |> Enum.each(fn user ->
      Stitch.Import.Slack.UserImport.parse_json(team, user)
    end)
  end

  def import_groups(team, users_by_slack_import_id, path) do
    Path.join(path, "channels.json")
    |> File.read!()
    |> Poison.decode!()
    |> Enum.each(fn channel ->
      Stitch.Import.Slack.GroupImport.parse_json(team, users_by_slack_import_id, channel)
    end)
  end

  def add_guests(team, path) do
    Path.join(path, "users.json")
    |> File.read!()
    |> Poison.decode!()
    |> Enum.each(fn user ->
      Stitch.Import.Slack.UserImport.add_guest(team, user)
    end)
  end

  def add_messages(team, users_by_slack_import_id, groups_by_slack_import_id, path) do
    Path.join(path, "channels.json")
    |> File.read!()
    |> Poison.decode!()
    |> Task.async_stream(
      fn
        %{"name" => channel_name, "id" => slack_channel_id} = channel ->
          group =
            Stitch.Repo.get_by(Stitch.Group, team_id: team.id, slack_import_id: slack_channel_id)

          if group && channel["is_archived"] != true do
            IO.puts("Importing messages for group #{group.name}")

            Path.wildcard(Path.join([path, channel_name, "*.json"]))
            |> Enum.each(fn message_file ->
              with {:ok, file} <- File.read(message_file),
                   {:ok, messages_json} <- Poison.decode(file) do
                Enum.each(messages_json, fn message_json ->
                  Stitch.Import.Slack.MessageImport.import_message(
                    team,
                    group,
                    users_by_slack_import_id,
                    groups_by_slack_import_id,
                    message_json
                  )
                end)
              else
                error ->
                  Logger.error("[#{__MODULE__}] Error parsing timestamp #{inspect(error)}")
              end
            end)
          else
            IO.puts("Skipping archived or non-existing channel #{channel_name}")
          end

        _ ->
          nil
      end,
      max_concurrency: 10,
      timeout: :infinity
    )
    |> Stream.run()
  end

  def clean_standard_default(team) do
    Stitch.Group
    |> where(team_id: ^team.id)
    |> where(is_default: true)
    |> where([g], is_nil(g.slack_import_id))
    |> Repo.delete_all()
  end

  def run do
    IO.puts("Begin import for team: #{@team_name}")
    {:ok, folder_path} = download_and_unzip()
    # folder_path = "/tmp/#{@team_name}-slack-export-contents/"

    IO.puts("Creating Team")
    {:ok, team} = Stitch.Import.Slack.TeamImport.find_or_create(@team_name, "STANDARD")

    IO.puts("Creating Users")
    import_users(team, folder_path)

    IO.puts("Creating avatars")
    Stitch.Import.Slack.UserImport.generate_default_avatars(team)

    IO.puts("Clean default group from team creation")
    clean_standard_default(team)

    IO.puts("Creating Groups")
    {:ok, _groups} = parse_groups(folder_path)
    users_by_slack_import_id = get_users_by_slack_import_id(team)
    import_groups(team, users_by_slack_import_id, folder_path)

    IO.puts("Adding guests")
    add_guests(team, folder_path)

    IO.puts("Adding messages")
    users_by_slack_import_id = get_users_by_slack_import_id(team)
    groups_by_slack_import_id = get_groups_by_slack_import_id(team)
    add_messages(team, users_by_slack_import_id, groups_by_slack_import_id, folder_path)
  end

  def get_users_by_slack_import_id(team) do
    team
    |> Stitch.TeamQueries.list_users()
    |> Enum.reduce(%{}, &Map.put(&2, &1.slack_import_id, &1))
  end

  def get_groups_by_slack_import_id(team) do
    team
    |> Stitch.TeamQueries.list_groups()
    |> Enum.reduce(%{}, &Map.put(&2, &1.slack_import_id, &1))
  end
end

Stitch.Import.Slack.run()
