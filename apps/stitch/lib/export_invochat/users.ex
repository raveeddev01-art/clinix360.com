defmodule Stitch.ExportInvochat.Users do
  alias Stitch.{Repo, Accounts.User}
  alias Stitch.ExportInvochat.{Request, Groups}
  import Ecto.Query

  @roles [["multi-room-guest"], ["single-room-guest"]]


  def create_user(user) do
    url = "/v4/users"
    body = %{"email" => user.email, "password" => "123456789", "username" => user.username}

    Request.post_api(url, body)
    |> case do
      %{"status_code" => 400} ->
        url = "/checkemail"
        body = %{"email" => user.email}
        id = Request.post_api(url, body)
        %{"id" => id}

      ok_case ->
        ok_case
    end
  end

  def add_all_users_in_ws_team(users, ws_team) do
    channel_id = Groups.team_common_channel(ws_team["team_id"])

    ws_team_channel = Map.merge(ws_team, %{"channel_id" => channel_id})

    users
    |> Task.async_stream(&add_user_in_common_channel(&1, ws_team_channel), timeout: :infinity)
    |> Enum.map(fn {:ok, result} -> result end)
    |> Enum.reduce(%{}, fn map, acc ->
      Map.merge(acc, map)
    end)
  end


  def get_workspace_users(team_id) do
    from(
      u in User,
      where: u.onboarded == true,
      where: u.disabled == false,
      where: u.team_id == ^team_id
    )
    |> Repo.all()
  end


  def get_admin(users) do
    Enum.filter(users, fn x -> x.roles == ["admin"] end)
    |> Enum.min_by(& &1.inserted_at)
  end

  def naive_to_mseconds(naive) do
    naive |> DateTime.from_naive!("Etc/UTC") |> DateTime.to_unix()
  end

  defp add_user_in_common_channel(user, ws) do
    user_id = create_user(user)["id"]
    ws_member = "/workspacemembers"

    ws_member_body = %{
      "workspace_id" => ws["workspace_id"],
      "user_id" => user_id,
      "roles" => role(user.roles),
      "delete_at" => 0,
      "scheme_guest" => false,
      "scheme_user" => true,
      "scheme_admin" => false,
      "create_at" => 0
    }

    team_channel = "/AutoLandingPage"

    team_channel_body = %{
      "team_id" => ws["team_id"],
      "user_id" => user_id,
      "channel_id" => ws["channel_id"]
    }

    Request.post_api(ws_member, ws_member_body)
    Request.post_api(team_channel, team_channel_body)

    %{"#{user.id}" => user_id}
  end

  defp role(role) when (role in @roles), do: "system_guest"
  defp role(_), do: "system_user"

end
