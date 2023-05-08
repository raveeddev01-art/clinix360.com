defmodule Stitch.ExportInvochat.Workspaces do
  @moduledoc """
  Workspace -> multiple Teams
  Team -> multiple channel
  Channel -> multiple users

  We dont have teams So  we simple create team by slack name
  and create a common channel Where all users added
  """
  alias Stitch.{Repo, Team}
  alias Stitch.ExportInvochat.{Request, Users}

  def create_workspace_team(user, user_id) do
    workspace = Repo.get(Team, user.team_id)

    ws_url = "/createworkspace"
    team_url = "/CreateTeamForOldInvochat"

    ws_body = %{
      "update_at" => 0,
      "delete_at" => 0,
      "display_name" => workspace.name,
      "name" => Users.name(workspace.name),
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


    team_body = %{"display_name" => workspace.slug, "name" => workspace.slug, "type" => "O", "email" => user.email}

    ws_res = Request.post_api(ws_url, ws_body)
    team_res = Request.post_api(team_url, team_body)

    con_url = "/teamworkspaceconjunction"
    con_body = %{"team_id" => team_res["id"], "workspace_id" => ws_res["id"]}
    Request.post_api(con_url, con_body)

    url = "/GetTeamChannelId"
    body = %{"team_id" => team_res["id"]}
    channel_id = Request.post_api(url, body)

    team_channel = "/AutoLandingPage"
    team_channel_body = %{
      "team_id" => team_res["id"],
      "user_id" => user_id,
      "channel_id" => channel_id
    }

    Request.post_api(team_channel, team_channel_body)

    %{"workspace_id" => ws_res["id"], "team_id" => team_res["id"]}
  end
end
