defmodule Stitch.ExportInvochat.Workspaces do
  @moduledoc """
  Workspace -> multiple Teams
  Team -> multiple channel
  Channel -> multiple users

  We dont have teams So  we simple create team by slack name
  and create a common channel Where all users added
  """
  alias Stitch.{Repo, Team, Accounts.User}
  alias Stitch.ExportInvochat.Request
  import Ecto.Query

  def create_workspace_team(user) do
    workspace = Repo.get(Team, user.team_id)

    ws_url = "/createworkspace"   #/api/createworkspace
    team_url = "/v4/teams"

    ws_body = %{
      "update_at" => 0,
      "delete_at" => 0,
      "display_name" => workspace.name,
      "name" => workspace.name,
      "description" => "",
      "email" => user.email,
      "type" => "O",
      "company_name" => "",
      "allowed_domains" => "",
      "invite_id" => "",
      "scheme_id" => "",
      "allow_open_invite" => true,
      "last_team_icon_update" => 0,
      "group_constrained" => false,
      "cloud_limits_archived" => true
    }



    team_body = %{"display_name" => workspace.slug, "name" => workspace.slug, "type" => "O"}

    ws_res = Request.request_invochat(ws_url, ws_body)
    team_res = Request.request_invochat(team_url, team_body)

    con_url = "/teamworkspaceconjunction"
    con_body = %{"team_id" => ws_res["id"], "workspace_id" => team_res["id"]}
    Request.request_invochat(con_url, con_body)

    %{"workspace_id" => ws_res["id"], "team_id" => team_res["id"]}
  end

  def test() do
    HTTPoison.post(
      "https://source-im.invo.zone/api/createworkspace",
      headers: [%{"Content-Type" => "application/json"}, %{"Authorization" => "Bearer huokuoz633yupcqi9zti4ywdna"}],
      body: Poison.encode!(%{
        "update_at" => 0,
        "delete_at" => 0,
        "display_name" => "Migration Test elixir",
        "name" => "Migration",
        "description" => "6666asC666",
        "email" => "xyz@migration.com",
        "type" => "O",
        "company_name" => "999999",
        "allowed_domains" => "10101010",
        "invite_id" => "",
        "scheme_id" => "",
        "allow_open_invite" => true,
        "last_team_icon_update" => 1313131,
        "group_constrained" => false,
        "cloud_limits_archived" => true
      })
    )

  end
end
