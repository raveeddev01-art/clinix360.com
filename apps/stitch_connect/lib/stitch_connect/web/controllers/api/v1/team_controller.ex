defmodule StitchConnect.Web.Api.V1.TeamController do
  use StitchConnect.Web, :controller

  def create(conn, %{"user_id" => user_id, "name" => name}) do
    case Stitch.Team.Onboarding.create_team(user_id, %{name: name}) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})
      team ->
        conn
        |> json({%{id: team.id, name: team.name, slug: team.slug}})
    end
  end
end
