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

  def run do
    IO.puts("Begin import for team: #{@team_name}")
    {:ok, folder_path} = download_and_unzip()

    IO.puts("Creating Team")
  end
end

Stitch.Import.Slack.run()
