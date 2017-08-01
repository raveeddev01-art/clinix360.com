defmodule StitchConnect.Web.Api.V1.InvitationController do
  use StitchConnect.Web, :controller
  plug StitchConnect.Plug.ApiAuthenticate when action in [:index]

  def index(conn, _params) do
    case Stitch.Invitations.list_team_invitations(conn.assign.current_user.id) do
      {:error, reason} ->
        conn
        |> put_status(:unauthorized)
        |> text "Unauthorized to see list of invitations."
      invitations ->
        render conn, "index.json", invitations: invitations
    end
  end

  def revoke(conn, %{"id" => id}) do
    case Stitch.Invitations.revoke_invitation(conn.assign.current_user.id, id) do
      {:error, reason} ->
        conn
        |> put_status(:unauthorized)
        |> text reason
      {:ok, invitation} ->
        conn
        |> json(%{message: "Invitation has been revoked."})
    end
  end

  def resend(conn, %{"id" => id}) do
    case Stitch.Invitations.resend_invitation(conn.assign.current_user.id, id) do
      {:error, reason} ->
        conn
        |> put_status(:unauthorized)
        |> text reason
      {:ok, invitation} ->
        render conn, "show.json", invitation: invitation
    end
  end
end
