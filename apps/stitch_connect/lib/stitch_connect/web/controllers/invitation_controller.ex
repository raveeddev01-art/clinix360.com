defmodule StitchConnect.Web.InvitationController do
  use StitchConnect.Web, :controller

  def accept(conn, %{"token" => invite_token}) do
    with {:ok, invitation} <- Stitch.Invitation.get_by_invite_token(invite_token)
    do
      app_params = Poison.encode!(%{
        "teamName" => conn.private[:team_name],
        "teamId" => conn.private[:team_id],
        "subdomain" => conn.private[:subdomain],
        "inviteToken" => invitation.invite_token
      })
      render conn, "accept.html", app_params: app_params
    else
      {:error, message} ->
        render conn, "invalid_invitation.html"
    end
  end
end
