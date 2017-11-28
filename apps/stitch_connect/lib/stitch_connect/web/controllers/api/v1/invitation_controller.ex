defmodule StitchConnect.Web.Api.V1.InvitationController do
  use StitchConnect.Web, :controller
  alias Stitch.{Invitation, MessageQueries, TeamAuthorization}
  alias StitchConnect.Web.{Endpoint, EventsChannel, TeamChannel}
  plug :fetch_session when action in [:accept]

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
    current_user = conn.assigns.current_user
    team = conn.assigns.team
    emails = email_collection |> String.split(",") |> Enum.uniq

    if TeamAuthorization.can_send_invites?(current_user, team) do
      results = Enum.reduce emails, %{}, fn email, map ->
        result = case Invitation.invite_to_team(current_user.id, email) do
          {:ok, _user} -> "ok"
          {:error, reason} -> reason
        end

        Map.put(map, email, result)
      end

      json(conn, results)
    else
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Unauthorized to send invites."})
    end
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
    result = Invitation.accept_and_complete_onboarding(invite_token, params)

    case result do
      {:ok, %{user: user, groups: groups}} ->
        Stitch.Billing.update_subscriber_count(conn.assigns.team)
        Enum.each(groups, fn {group, system_message} ->
          system_message = system_message |> MessageQueries.load_info
          Endpoint.broadcast("groups:#{group.slug}", "new_msg", system_message)
          EventsChannel.broadcast_group_new_msg(group, system_message)
          TeamChannel.broadcast_user_joined(conn.assigns.team, user)
        end)
        conn
        |> login_user(user)
        |> json(%{id: user.id, email: user.email, onboarded: user.onboarded})

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})

      {:error, message} when is_binary(message) ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})

      {:error, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Could not finish onboarding user."})
    end
  end

  def accept(conn, _) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(%{message: "Some parameter missing out of token, first_name, last_name, username, password, pin."})
  end
end
