defmodule StitchConnect.Web.Api.V1.TeamController do
  use StitchConnect.Web, :controller
  alias Stitch.Team

  plug StitchConnect.Plug.TeamAdminOnly when action in [:update_security_lockout_time, :update_open_invitation, :delete_team]

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

  def update_security_lockout_time(conn, %{"id" => _, "enabled" => enabled, "seconds_to_lockout": seconds_to_lockout}) do
    case Team.Admin.update_security_lockout_time(conn.private[:team_id], enabled, seconds_to_lockout) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Couldn't update the security lockout time"})
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
      {:error, message} ->
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
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Couldn't destroy the team."})
      {:ok, team} ->
        conn
        |> json(%{message: "Team has been destroyed"})
    end
  end

end
