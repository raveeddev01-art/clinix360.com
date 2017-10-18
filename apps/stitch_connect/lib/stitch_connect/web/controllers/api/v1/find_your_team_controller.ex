defmodule StitchConnect.Web.Api.V1.FindYourTeamController do
  use StitchConnect.Web, :controller
  alias Stitch.{FindYourTeam, TeamQueries, UserQueries}

  def create(conn, %{"email" => email}) do
    if UserQueries.user_with_email_exists?(email) do
      email
      |> FindYourTeam.create_or_get_token!
      |> FindYourTeam.email(StitchConnect.Web.Endpoint.url)
      |> Stitch.Mailer.deliver_later

      json(conn, %{message: "Email has been sent to #{email}. Please check your inbox."})
    else
      conn
      |> put_status(:not_found)
      |> json(%{message: "Email not found."})
    end
  end
end
