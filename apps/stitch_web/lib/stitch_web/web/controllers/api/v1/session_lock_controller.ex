defmodule Stitch.Web.Api.V1.SessionLockController do
  use Stitch.Web, :controller
  alias Stitch.Accounts.ActivityTracker

  def lock(conn, _) do
    conn
    |> lock_user_session()
    |> json(nil)
  end

  def unlock(conn, %{"pin" => pin}) do
    user = conn.assigns.current_user
    team = conn.assigns.team

    if pin == user.pin ||
         Stitch.User.Authentication.validate_user_email_and_password(user.email, pin, team) do
      ActivityTracker.async_update_activity(user)

      conn
      |> unlock_user_session()
      |> json(nil)
    else
      conn
      |> put_status(403)
      |> json(%{message: "PIN is incorrect"})
    end
  end
end
