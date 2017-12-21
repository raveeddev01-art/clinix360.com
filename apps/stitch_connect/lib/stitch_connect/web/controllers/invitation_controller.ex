defmodule StitchConnect.Web.InvitationController do
  use StitchConnect.Web, :controller

  @refactor """
  Break out each branch below into a well-named private function
  so the control flow is flattended out. This will allow the
  code to be more easily refactor and understood at a glance.
  """
  def accept(conn, %{"token" => invite_token}) do
    with {:ok, invitation} <- Stitch.Invitation.get_by_invite_token(invite_token)
    do
      case invitation.team_id == conn.private[:team_id] do
        true ->
          case invitation.user.onboarded do
            false ->
              app_params = Poison.encode!(%{
                "teamName" => conn.private[:team_name],
                "teamId" => conn.private[:team_id],
                "subdomain" => conn.private[:subdomain],
                "inviteToken" => invitation.invite_token
              })
              render conn, "accept.html", app_params: app_params
            true ->
              app_params = Poison.encode!(%{
                "inviteToken" => "",
                "error" => "Already onboarded",
              })
              render conn, "accept.html", app_params: app_params
          end

        false ->
          app_params = Poison.encode!(%{
            "inviteToken" => ""
          })
          render conn, "accept.html", app_params: app_params
      end
    else
      {:error, _message} ->
        app_params = Poison.encode!(%{
          "inviteToken" => ""
        })
        render conn, "accept.html", app_params: app_params
    end
  end

  def error(conn, _params) do
    app_params = Poison.encode!(%{
      "inviteToken" => ""
    })
    render conn, "accept.html", app_params: app_params
  end
end
