defmodule StitchConnect.Web.Api.V1.SessionLockController do
  use StitchConnect.Web, :controller
  plug StitchConnect.Plug.ApiAuthenticate

  def lock(conn, _) do
    conn
    |> put_session(:locked, true)
    |> json(nil)
  end

  def unlock(conn, %{"pin" => pin}) do
    user = conn.assigns.current_user
    team_slug = conn.private[:team_slug]

    if pin == user.pin ||
      Stitch.User.Authentication.validate_email_and_password(user.email, pin, team_slug) do
      conn
      |> put_session(:locked, false)
      |> json(nil)
    else
      conn
      |> put_status(403)
      |> json(%{message: "PIN is incorrect"})
    end
  end
end
