defmodule Stitch.Export.Invochat do
  alias Stitch.Repo
  import Ecto.Query
  alias Stitch.ExportInvochat.{Request, Workspaces, Users}

  @path "apps/stitch/lib/export_invochat/"

  def perform(team_id) do
    IO.puts("Starting Export.......................................................")

    users = Users.get_workspace_users(team_id)
    admin = Users.get_admin(users)

    ws_team = create_owner_with_ws(team_id, admin)

    IO.puts("Added General Team Channel............................................")

    users_data =
      Enum.reject(users, fn user -> user.id == admin.id end)
      |> Users.add_all_users_in_ws_team(ws_team)
      |> IO.inspect(label: "Add all users to Generic channel")

    IO.puts("Added Users...........................................................")
    file = "users_" <> Integer.to_string(team_id) <> ".json"

    users =
      read_file(file)
      |> Map.merge(users_data)

    users
    |> store_in_file(file)
    |> IO.inspect(
      label: "Function succesfully endded......................................................"
    )
  end

  def create_owner_with_ws(team_id, admin) do
    owner_id = Users.create_user(admin)["id"]

    user_file = "users_" <> Integer.to_string(team_id) <> ".json"
    store_in_file(%{Integer.to_string(admin.id) => owner_id}, user_file)

    ws_data = Workspaces.create_workspace_team(admin)
    ws_file = "workspace_" <> Integer.to_string(team_id) <> ".json"
    store_in_file(ws_data, ws_file)

    ws_data
  end

  defp store_in_file(data, file_name) do
    path = Path.join(@path, file_name)

    json = Poison.encode!(data)
    :ok = File.write(path, json)
  end

  defp read_file(file_name) do
    {:ok, data} =
      Path.join(@path, file_name)
      |> File.read!()

    Poison.decode!(data)
  end
end

Stitch.Export.Invochat.perform(27)
