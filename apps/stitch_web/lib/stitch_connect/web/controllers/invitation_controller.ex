defmodule StitchConnect.Web.InvitationController do
  use Stitch.Web, :controller

  alias Stitch.{
    Invitation,
    PatientQueries,
    Web.TeamChannel
  }

  def accept(conn, %{"token" => invite_token}) do
    get_is_onboarded = fn invitation ->
      invitation.user.onboarded
    end

    do_accept(conn, invite_token, get_is_onboarded)
  end

  def patient_accept(conn, %{"token" => invite_token}) do
    get_is_onboarded = fn invitation ->
      invitation.patient.onboarded
    end

    do_accept(conn, invite_token, get_is_onboarded)
  end

  def error(conn, _params) do
    render(conn, "accept.html", app_params: app_params_for_error())
  end

  defp do_accept(conn, invite_token, get_is_onboarded) do
    with {:ok, invitation} <- Invitation.get_by_invite_token(invite_token) do
      case invitation.team_id == conn.private[:team_id] do
        true ->
          case get_is_onboarded.(invitation) do
            false ->
              render(conn, "accept.html", app_params: success_params(conn, invite_token))

            true ->
              render(conn, "accept.html", app_params: app_params_for_already_onboarded())
          end

        false ->
          render(conn, "accept.html", app_params: app_params_for_error())
      end
    else
      _ ->
        render(conn, "accept.html", app_params: app_params_for_error())
    end
  end

  defp success_params(conn, invite_token) do
    Poison.encode!(%{
      "teamName" => conn.private[:team_name],
      "teamId" => conn.private[:team_id],
      "subdomain" => conn.private[:subdomain],
      "inviteToken" => invite_token
    })
  end

  defp app_params_for_error do
    Poison.encode!(%{"inviteToken" => ""})
  end

  defp app_params_for_already_onboarded do
    Poison.encode!(%{
      "inviteToken" => "",
      "error" => "Already onboarded"
    })
  end
end
