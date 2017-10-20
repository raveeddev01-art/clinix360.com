defmodule StitchConnect.Web.Api.V1.InvitationController do
  use StitchConnect.Web, :controller
  alias Stitch.{Invitation}
  alias StitchConnect.Web.{Endpoint}

  def index(conn, _params) do
    case Invitation.list_pending_team_invitations(conn.assigns.current_user.id) do
      {:error, _} ->
        conn
        |> put_status(:unauthorized)
        |> text("Unauthorized to see list of invitations.")

      invitations ->
        render conn, "index.json", invitations: invitations
    end
  end

  def show(conn, %{"token" => invite_token}) do
    with {:ok, invitation} <- Invitation.get_by_invite_token(invite_token)
    do
      render conn, "show.json", invitation: invitation
    else
      {:error, _} ->
        conn
        |> json(%{message: "An invitation with this invite_token doesn't exist."})
    end
  end

  def create(conn, %{"email_collection" => email_collection}) do
    emails = String.split(email_collection, ",")
    Enum.each(emails, fn(email) ->
      Invitation.invite_to_team(conn.assigns.current_user.id, email)
    end)
    conn
    |> json(%{message: "Invitations sent to all users."})
  end

  def revoke(conn, %{"id" => id}) do
    case Invitation.revoke_invitation(conn.assigns.current_user.id, id) do
      {:error, reason} ->
        conn |> put_status(:unauthorized) |> text(reason)
      {:ok, _} ->
        conn
        |> json(%{message: "Invitation has been revoked."})
    end
  end

  def resend(conn, %{"id" => id}) do
    case Invitation.resend_invitation(conn.assigns.current_user.id, id) do
      {:error, reason} ->
        conn |> put_status(:unauthorized) |> text(reason)
      {:ok, invitation} ->
        render conn, "show.json", invitation: invitation
    end
  end

  def accept(conn, %{"token" => invite_token} = params) do
    result = Stitch.Invitation.accept_and_complete_onboarding(invite_token, params)

    case result do
      {:ok, %{onboarded_user: user, default_group: default_group, system_message: system_message}} ->
        Endpoint.broadcast("groups:#{default_group.slug}", "new_msg", system_message)
        conn
        |> json(%{id: user.id, email: user.email, onboarded: user.onboarded})
      {:error, _, message, _} when is_binary(message) ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})
      {:error, _, _, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Error onboarding the user."})
    end
  end

  def accept(conn, _) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(%{message: "Some parameter missing out of token, first_name, last_name, username, password, pin."})
  end

end
