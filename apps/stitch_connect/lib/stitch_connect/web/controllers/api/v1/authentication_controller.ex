defmodule StitchConnect.Web.Api.V1.AuthenticationController do
  use StitchConnect.Web, :controller

  def submit_login(conn, %{"email" => email, "password" => password}) do
    team_slug = conn.private[:team_slug]
    case Stitch.User.Authentication.validate_email_and_password(email, password, team_slug) do
      false ->
        conn
        |> put_status(403)
        |> json(%{message: "Email or password is incorrect."})
      user ->
        conn
        |> json(%{authenticationToken: user.token})
    end
  end
end
