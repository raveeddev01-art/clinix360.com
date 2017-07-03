defmodule StitchConnect.Web.Api.V1.TeamController do
  use StitchConnect.Web, :controller
  alias Stitch.Team

  def create(conn, %{"user_id" => user_id, "name" => name}) do
    case Team.Onboarding.create_team(user_id, %{name: name}) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})
      team ->
        conn
        |> json({%{id: team.id, name: team.name, slug: team.slug}})
    end
  end

  def availability(conn, %{"name" => name}) do
    conn
    |> json(%{available: Team.Onboarding.name_available?(name)})
  end
end
