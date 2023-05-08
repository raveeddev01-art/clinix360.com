defmodule Stitch.Export.Invochat do
  alias Stitch.Repo
  import Ecto.Query
  alias Stitch.ExportInvochat.{Request, Workspaces, Users, Groups, Messages}

  @path "apps/stitch/lib/export_invochat/"

  def perform(team_id) do
    ##########################################################
    users = Users.get_workspace_users(team_id)
    admin = Users.get_admin(users)
    ws_team = create_owner_with_ws(team_id, admin)
    ##########################################################
    users_ids = users_member(users, admin, ws_team, team_id)
    ##########################################################
    channel_ids = create_store_channel(team_id, ws_team, users_ids)
    ##########################################################
    post_messages(team_id, channel_ids, users_ids)
  end

  def create_owner_with_ws(team_id, admin) do
    owner_id = Users.create_user(admin)["id"]

    user_file = "users_" <> Integer.to_string(team_id) <> ".json"
    store_in_file(%{Integer.to_string(admin.id) => owner_id}, user_file)

    ws_data = Workspaces.create_workspace_team(admin, owner_id)
    ws_file = "workspace_" <> Integer.to_string(team_id) <> ".json"
    store_in_file(ws_data, ws_file)

    ws_data
    |> Map.merge(%{"admin_id" => owner_id})
  end

  defp users_member(users, admin, ws_team, team_id) do
    users_ids =
      Enum.reject(users, fn user -> user.id == admin.id end)
      |> Users.add_all_users_in_ws_team(ws_team)

    file = "users_" <> Integer.to_string(team_id) <> ".json"

    users =
      read_file(file)
      |> Map.merge(users_ids)

   users
    |> store_in_file(file)

    users
  end

  defp create_store_channel(team_id, ws_team, users_ids) do
    channel_ids = Groups.add_users_channel(team_id, ws_team, users_ids)
    file = "channel_" <> Integer.to_string(team_id) <> ".json"

    channel_ids
    |> store_in_file(file)

    channel_ids
  end

  defp post_messages(team_id, channel_ids, users_ids) do
    post_ids = Messages.channels_messages_with_reactions(channel_ids, users_ids)
    file = "messages_" <> Integer.to_string(team_id) <> ".json"

    post_ids
    |> store_in_file(file)

    post_ids
  end

  defp store_in_file(data, file_name) do
    path = Path.join(@path, file_name)

    json = Poison.encode!(data)
    :ok = File.write(path, json)
  end

  defp read_file(file_name) do
    data =
      Path.join(@path, file_name)
      |> File.read!()

    Poison.decode!(data)
  end
end

Stitch.Export.Invochat.perform(80)
