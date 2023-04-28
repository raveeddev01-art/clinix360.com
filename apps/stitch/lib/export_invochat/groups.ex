defmodule Stitch.ExportInvochat.Groups do
  alias Stitch.ExportInvochat.Request
  alias Stitch.{Repo, Group, GroupUser}

  import Ecto.Query

  def team_common_channel(team_id) do
    url = "/GetTeamChannelId "
    body = %{"team_id" => team_id}
    Request.post_api(url, body)
  end

  def team_channel(team_id) do
    from(
      g in Group,
      where: g.team_id == ^team_id,
      where: g.name not in ["__dm_group__", "__multi_dm_group__"]
    )
    |> Repo.all()
  end

  def add_users_channel(internal_team_id, admin_and_team_id, users) do
    channels = team_channel(internal_team_id)

    channels
    |> Task.async_stream(&create_channel_add_users(&1, admin_and_team_id, users),
      timeout: :infinity
    )
    |> Enum.map(fn {:ok, result} -> result end)
    |> Enum.reduce(%{}, fn map, acc ->
      Map.merge(acc, map)
    end)
  end

  def create_channel_add_users(channel, params, users) do
    creater_id = channel_creater(channel, params, users)

    url = "/v4/channels"

    body = %{
      "team_id" => params["team_id"],
      "name" => channel.name,
      "display_name" => channel.slug,
      "purpose" => "",
      "header" => "",
      "type" => public(channel.public),
      "create_at" => 0,
      "creator_id" => creater_id,
      "delete_at" => 0,
      "group_constrained" => false,
      "id" => "",
      "last_post_at" => 0,
      "last_root_post_at" => 0,
      "scheme_id" => "",
      "update_at" => 0
    }

    channel_id = create_channel(url, body)

    channal_map =
      params
      |> Map.merge(%{
        "internal_channel_id" => channel.id,
        "invo_channel_id" => channel_id,
        "creater_id" => creater_id
      })

    add_users_into_channel(channal_map, users)

    %{"#{channel.id}" => channel_id}
  end

  def create_channel(url, body) do
    Request.post_api(url, body)
    |> case do
      %{"message" => "Name must be" <> msg} ->
        name_lowercase = String.downcase(body["name"])
        name_without_space = Regex.replace(~r/\s/, name_lowercase, "")
        body = Map.put(body, "name", name_without_space)
        Request.post_api(url, body)["id"]

      ok ->
        ok["id"]
    end
  end

  def add_users_into_channel(channal_map, users) do
    get_channel_users(channal_map, users)
    |> Enum.map(&add_user_in_channel(&1, channal_map))
  end

  def add_user_in_channel(user_id, channal_map) do
    team_id = channal_map["team_id"]
    channel_id = channal_map["invo_channel_id"]

    url = "/AutoLandingPage"
    body = %{"team_id" => team_id, "user_id" => user_id, "channel_id" => channel_id}
    Request.post_api(url, body)
  end

  def get_channel_users(channal_map, users) do
    channel_id = channal_map["internal_channel_id"]
    channel_admin_id = key_from_value(channal_map["creater_id"], users)

    from(u in GroupUser, where: u.group_id == ^channel_id)
    |> Repo.all()
    |> Enum.reject(fn x -> x.user_id == channel_admin_id end)
    |> Enum.map(fn x -> get_invo_user_id(x.user_id, users) end)
  end

  def key_from_value(value, users) do
    Enum.find(users, fn {_k, v} -> v == value end) |> elem(0) |> String.to_integer()
  end

  defp get_invo_user_id(id, users) do
    Map.get(users, "#{id}")
  end

  defp public(true), do: "O"
  defp public(false), do: "P"

  defp channel_creater(channel, params, users) do
    channel.creator_user_id
    |> case do
      nil -> params["admin_id"]
      id -> get_invo_user_id(id, users)
    end
  end
end
