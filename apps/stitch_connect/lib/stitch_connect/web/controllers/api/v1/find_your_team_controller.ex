defmodule StitchConnect.Web.Api.V1.FindYourTeamController do
  use StitchConnect.Web, :controller
  alias Stitch.{FindYourTeam, TeamQueries, UserQueries}

  def create(conn, %{"email" => email}) do
    if UserQueries.user_with_email_exists?(email) do
      email
      |> FindYourTeam.create_or_get_token!
      |> FindYourTeam.email(StitchConnect.Web.Endpoint.url)
      |> Stitch.Mailer.deliver_later
    end

    conn
    |> json(%{message: "Email has been sent to #{email}. Please check your inbox."})
  end

  def delete(conn, %{"token" => token}) do
    case FindYourTeam.get_by_token(token) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "Token not found."})
      token ->
        {:ok, token} = FindYourTeam.delete_token(token)

        teams =
          token.email
          |> TeamQueries.all_with_user_email()
          |> Enum.map(&Map.take(&1, [:name, :slug]))

        json(conn, %{teams: teams})
    end
  end
end
