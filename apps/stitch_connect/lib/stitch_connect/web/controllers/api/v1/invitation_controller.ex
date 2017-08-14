defmodule StitchConnect.Web.Api.V1.InvitationController do
  use StitchConnect.Web, :controller
  plug StitchConnect.Plug.ApiAuthenticate when action in [:index, :create, :revoke, :resend, :accept]

  def index(conn, _params) do
    case Stitch.Invitation.list_pending_team_invitations(conn.assigns.current_user.id) do
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

  def accept(conn, %{"email" => email, "first_name" => first_name, "last_name" => last_name, "username" => username, "password" => password, "pin" => pin, "team_id" => team_id}) do
    case Stitch.Accounts.create_and_complete_user_onboarding(%{email: email, first_name: first_name, last_name: last_name, username: username, password: password, pin: pin, team_id: team_id, roles: ["member"]}) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})
      user ->
        conn
        |> json(%{id: user.id, email: user.email, onboarded: user.onboarded})
    end
  end
  
  def accept(conn, _) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(%{message: "Some parameter missing out of email, first_name, last_name, username, password, pin."})
  end

end
