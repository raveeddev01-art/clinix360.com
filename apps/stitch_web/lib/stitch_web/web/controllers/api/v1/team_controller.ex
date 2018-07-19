defmodule Stitch.Web.Api.V1.TeamController do
  use Stitch.Web, :controller
  alias Stitch.Team.Admin
  alias Stitch.{Team, TeamQueries, TeamAuthorization}
  alias Stitch.Web.TeamChannel

  action_fallback(Stitch.Web.Api.FallbackController)

  def show(conn, %{"id" => _}) do
    team = TeamQueries.get_by_id(conn.private[:team_id])

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
    with {:team, {:ok, %{team: team}}} <- {:team, Team.Onboarding.create_team(name, slug)} do
      conn
      |> json(%{id: team.id, name: team.name, slug: team.slug})
    else
      {:team, {:error, _action, changeset, _}} ->
        {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}
    end
  end

  def features(conn, _params) do
    features =
      TeamQueries.get_by_id(conn.private[:team_id])
      |> Stitch.FeatureGateway.available_features()

    conn
    |> json(features)
  end

  def url_available(conn, %{"url" => url}) do
    conn
    |> json(%{available: Team.Onboarding.slug_available?(url)})
  end

  def slug_exists(conn, %{"url" => url}) do
    conn
    |> json(%{available: Team.Onboarding.slug_exists?(url)})
  end

  def name_from_slug(conn, %{"slug" => slug}) do
    case TeamQueries.get_by_slug(slug) do
      nil ->
        {:error, :not_found}

      team ->
        conn
        |> json(%{name: team.name})
    end
  end

  def update(conn, %{"id" => _, "name" => name}) do
    case Team.Admin.update_name(conn.private[:team_id], name) do
      {:error, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Couldn't update name"})

      {:ok, team} ->
        TeamChannel.broadcast_team_rename(team)

        conn
        |> json(%{id: team.id, name: team.name})
    end
  end

  def show_contact_info(conn, %{"id" => _}) do
    team = conn.assigns.team
    render(conn, "contact_info.json", team: team)
  end

  def update_contact_info(conn, %{"id" => _} = params) do
    with team = conn.assigns.team, {:ok, team} <- Admin.update_contact_info(team, params) do
      TeamChannel.broadcast_team_rename(team)
      render(conn, "contact_info.json", team: team)
    else
      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})

      error ->
        error
    end
  end

  def update_security_lockout_time(conn, %{
        "id" => _,
        "enabled" => enabled,
        "seconds_to_lockout" => seconds_to_lockout
      }) do
    case Team.Admin.update_security_lockout_time(
           conn.private[:team_id],
           enabled,
           seconds_to_lockout || 900
         ) do
      {:error, _reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "bad"})

      {:ok, team} ->
        TeamChannel.broadcast_security_lockout_update(team)

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

  def toggle_conceal(conn, %{"id" => _}) do
    user = conn.assigns.current_user
    team = conn.assigns.team

    with {:authorized?, true} <- {:authorized?, TeamAuthorization.is_admin?(user, team)},
         {:ok, team} <- Team.Admin.toggle_conceal_switch(team) do
      TeamChannel.broadcast_conceal_toggled(team)
      conn |> json(%{id: team.id, conceal_enabled: team.conceal_enabled})
    else
      {:authorized?, false} -> {:error, :not_authorized}
      _ -> {:error, :not_found}
    end
  end

  def delete_team(conn, %{"id" => _}) do
    case Team.Admin.delete_team(conn.private[:team_id]) do
      {:error, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Couldn't destroy the team."})

      {:ok, team} ->
        TeamChannel.broadcast_team_deleted(team)

        conn
        |> json(%{message: "Team has been destroyed"})
    end
  end

  def access_log(conn, %{"id" => _} = params) do
    pagination_opts = parse_pagination_params(params, [:limit, :skip])
    team = conn.assigns.team
    paginated_result = Stitch.Accounts.AccessLog.list(team, pagination_opts)
    render(conn, "access_log.json", access_log: paginated_result)
  end
end
