defmodule StitchConnect.Web.Api.V1.InvitationController do
  use StitchConnect.Web, :controller
  plug StitchConnect.Plug.ApiAuthenticate when action in [:index]

  def index(conn, _params) do
    case Stitch.Invitation.list_team_invitations(conn.assigns.current_user.id) do
      {:error, reason} ->
        conn
        |> put_status(:unauthorized)
        |> text "Unauthorized to see list of invitations."
      invitations ->
        render conn, "index.json", invitations: invitations
    end
  end

  def create(conn, %{"email_collection" => email_collection}) do
    emails = String.split(email_collection, ",")
    Enum.each(emails, fn(email) ->
      Stitch.Invitation.invite_to_team(conn.assigns.current_user.id, email)
    end)
    conn
    |> json(%{message: "Invitations sent to all users."})
  end

  def revoke(conn, %{"id" => id}) do
    case Stitch.Invitation.revoke_invitation(conn.assigns.current_user.id, id) do
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
    case Stitch.Invitation.resend_invitation(conn.assigns.current_user.id, id) do
      {:error, reason} ->
        conn
        |> put_status(:unauthorized)
        |> text reason
      {:ok, invitation} ->
        render conn, "show.json", invitation: invitation
    end
  end
end
