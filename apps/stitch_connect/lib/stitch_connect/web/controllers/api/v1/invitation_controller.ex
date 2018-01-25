defmodule StitchConnect.Web.Api.V1.InvitationController do
  use StitchConnect.Web, :controller
  alias Stitch.{Invitation, FeatureGateway, TeamAuthorization}
  alias StitchConnect.Web.{GroupChannel, EventsChannel, TeamChannel}

  plug :fetch_session when action in [:accept]
  action_fallback StitchConnect.Web.Api.FallbackController

  def index(conn, _params) do
    with team = conn.assigns.team,
         user = conn.assigns.current_user,
         {:authorized, true} <- {:authorized, TeamAuthorization.can_send_invites?(user, team)} do
      invitations = Invitation.list_pending_team_invitations(team)
      render conn, "index.json", invitations: invitations
    else
      {:authorized, false} ->
        conn
        |> put_status(:unauthorized)
        |> text("Unauthorized to see list of invitations.")
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

  def invite_single_room_guests(conn, params) do
    case FeatureGateway.allowed?(:guests, conn.assigns.subscription) do
      :ok ->
        response =
          Enum.reduce(Map.get(params, "emails", []), %{}, fn (email, acc) ->
            case Invitation.invite_as_single_room_guest(conn.assigns.current_user, conn.assigns.team, %{"email" => email, "group_id" => params["group_id"]}) do
              {:ok, invitation} ->
                EventsChannel.broadcast_invitation_sent(conn.assigns.team, invitation.user, invitation)
                Map.put(acc, email, "ok")
              {:error, :group_not_found} ->
                Map.put(acc, email, "Invalid group id.")
              {:error, changeset} ->
                Map.put(acc, email, changeset_errors_to_string(changeset))
              _ -> acc
            end
          end)

        conn
        |> put_status(:created)
        |> json(response)
      error -> error
    end
  end

  def invite_single_room_guest(conn, params) do
    with :ok <- FeatureGateway.allowed?(:guests, conn.assigns.subscription),
         {:ok, invitation} <- Invitation.invite_as_single_room_guest(conn.assigns.current_user, conn.assigns.team, params) do
      EventsChannel.broadcast_invitation_sent(conn.assigns.team, invitation.user, invitation)
      conn
      |> put_status(:created)
      |> json(%{message: "Invitation sent."})
    else
      {:error, :group_not_found} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: %{group_id: ["Invalid group id."]}})
      error -> error
    end
  end

  def invite_multi_room_guests(conn, params) do
    current_user = conn.assigns.current_user
    team = conn.assigns.team
    case FeatureGateway.allowed?(:guests, conn.assigns.subscription) do
      :ok ->
        response =
          Enum.reduce(Map.get(params, "emails", []), %{}, fn (email, acc) ->
            case Invitation.invite_as_multi_room_guest(current_user, team, %{"email" => email, "group_ids" => params["group_ids"]}) do
              {:ok, invitation} ->
                EventsChannel.broadcast_invitation_sent(team, invitation.user, invitation)
                Map.put(acc, email, "ok")
              {:error, :invalid_groups, _group_ids} ->
                Map.put(acc, email, "Invalid group ids")
              {:error, changeset} ->
                Map.put(acc, email, changeset_errors_to_string(changeset))
              _ -> acc
            end
          end)

        conn
        |> put_status(:created)
        |> json(response)
      error -> error
    end
  end

  def invite_multi_room_guest(conn, params) do
    with :ok <- FeatureGateway.allowed?(:guests, conn.assigns.subscription),
         {:ok, invitation} <- Invitation.invite_as_multi_room_guest(conn.assigns.current_user, conn.assigns.team, params) do
      EventsChannel.broadcast_invitation_sent(conn.assigns.team, invitation.user, invitation)
      conn
      |> put_status(:created)
      |> json(%{message: "Invitation sent."})
    else
      {:error, :invalid_groups, group_ids} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: %{group_ids: ["Invalid group ids (#{Enum.join(group_ids, ",")})."]}})
      error -> error
    end
  end

  def create(conn, %{"email_collection" => email_collection}) do
    current_user = conn.assigns.current_user
    team = conn.assigns.team
    emails = email_collection |> String.split(",") |> Enum.uniq

    if TeamAuthorization.can_send_invites?(current_user, team) do
      results = Enum.reduce emails, %{}, fn email, map ->
        result = case Invitation.invite_to_team(current_user.id, email) do
          {:ok, invitation} ->
            EventsChannel.broadcast_invitation_sent(team, invitation.user, invitation)
            "ok"
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
      {:ok, invitation} ->
        EventsChannel.broadcast_invitation_revoked(conn.assigns.team, invitation, invitation.user.id)
        conn |> json(%{message: "Invitation has been revoked."})
    end
  end

  def accept(conn, %{"token" => invite_token} = params) do
    result = Invitation.accept_and_complete_onboarding(invite_token, params)

    case result do
      {:ok, %{user: user, groups: groups}} ->
        Stitch.Billing.update_subscriber_count(conn.assigns.team)
        TeamChannel.broadcast_user_joined(conn.assigns.team, user)
        Enum.each(groups, fn group ->
          GroupChannel.broadcast_members_update(group, [], [user])
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
