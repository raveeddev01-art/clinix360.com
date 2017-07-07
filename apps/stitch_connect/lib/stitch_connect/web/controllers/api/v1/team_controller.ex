defmodule StitchConnect.Web.Api.V1.TeamController do
  use StitchConnect.Web, :controller
  alias Stitch.Team

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
end
