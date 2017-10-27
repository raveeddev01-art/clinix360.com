defmodule StitchConnect.Web.InvitationController do
  use StitchConnect.Web, :controller

  def accept(conn, %{"token" => invite_token}) do
    with {:ok, invitation} <- Stitch.Invitation.get_by_invite_token(invite_token)
    do
      case invitation.team_id == conn.private[:team_id] do
        true ->
          app_params = Poison.encode!(%{
            "teamName" => conn.private[:team_name],
            "teamId" => conn.private[:team_id],
            "subdomain" => conn.private[:subdomain],
            "inviteToken" => invitation.invite_token
          })
          render conn, "accept.html", app_params: app_params
        false ->
          render conn, "invalid_invitation.html"
      end
    else
      {:error, _message} ->
        render conn, "invalid_invitation.html"
    end
  end
end
