defmodule Stitch.Import.Slack do
  alias Stitch.Repo
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
    IO.inspect(groups)
    {:ok, groups}
  end

  def parse_users(path) do
    Path.join(path, "users.json")
    |> File.read!()
    |> Poison.decode!()
    |> Enum.each(fn user ->
      # TODO: Use real team
      team = Stitch.Repo.all(Stitch.Team) |> List.first()
      Stitch.Import.Slack.UserImport.parse_json(team, user)
    end)
  end

  def run do
    IO.puts("Begin import for team: #{@team_name}")
    {:ok, folder_path} = download_and_unzip()

    IO.puts("Creating Team")

    IO.puts("Creating Users")
    parse_users(folder_path)

    IO.puts("Creating Groups")
    {:ok, groups} = parse_groups(folder_path)
  end
end

Stitch.Import.Slack.run()
