defmodule StitchConnect.Web.Api.V1.TeamController do
  use StitchConnect.Web, :controller
  alias Stitch.Team

  def show(conn, %{"id" => _}) do
    team = Stitch.TeamQueries.get_by_id(conn.private[:team_id])
    conn
    |> json(%{
      id: team.id,
      name: team.name,
      slug: team.slug,
      security_lockout: team.security_lockout,
      seconds_to_lockout: team.seconds_to_lockout,
      open_invitations_enabled: team.open_invitations_enabled
    })
  end

  def create(conn, %{"name" => name, "url" => slug}) do
    case Team.Onboarding.create_team(name, slug) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})
      team ->
        conn
        |> json(%{id: team.id, name: team.name, slug: team.slug})
    end
  end

  def url_available(conn, %{"url" => url}) do
    conn
    |> json(%{available: Team.Onboarding.slug_available?(url)})
  end

  def slug_exists(conn, %{"url" => url}) do
    conn
    |> json(%{available: Team.Onboarding.slug_exists?(url)})
  end

  def update(conn, %{"id" => _, "name" => name}) do
    case Team.Admin.update_name(conn.private[:team_id], name) do
      {:error, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Couldn't update name"})
      {:ok, team} ->
        StitchConnect.Web.TeamChannel.broadcast_team_rename(team)
        conn
        |> json(%{id: team.id, name: team.name})
    end
  end

  def update_security_lockout_time(conn, %{"id" => _, "enabled" => enabled, "seconds_to_lockout" => seconds_to_lockout}) do
    case Team.Admin.update_security_lockout_time(conn.private[:team_id], enabled, seconds_to_lockout || 900) do
      {:error, _reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "bad"})
      {:ok, team} ->
        conn
        |> json(%{
          id: team.id,
          name: team.name,
          security_lockout: team.security_lockout,
          seconds_to_lockout: team.seconds_to_lockout
        })
    end
  end

  def update_open_invitation(conn, %{"id" => _, "enabled" => enabled}) do
    case Team.Admin.update_open_invitation(conn.private[:team_id], enabled) do
      {:error, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Couldn't update the open invitation setting."})
      {:ok, team} ->
        conn
        |> json(%{
          id: team.id,
          name: team.name,
          open_invitations_enabled: team.open_invitations_enabled
        })
    end
  end

  def delete_team(conn, %{"id" => _}) do
    case Team.Admin.delete_team(conn.private[:team_id]) do
      {:error, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Couldn't destroy the team."})
      {:ok, team} ->
        StitchConnect.Web.TeamChannel.broadcast_team_deleted(team)
        conn
        |> json(%{message: "Team has been destroyed"})
    end
  end

end
