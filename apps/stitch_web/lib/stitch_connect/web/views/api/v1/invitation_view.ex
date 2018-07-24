defmodule StitchConnect.Web.Api.V1.InvitationView do
  use Stitch.Web, :view

  def render("index.json", %{invitations: invitations}) do
    Enum.map(invitations, &invitation_json/1)
  end

  def render("show.json", %{invitation: invitation}) do
    invitation_json(invitation)
  end

  def invitation_json(invitation) do
    email =
      case invitation.user do
        nil -> invitation.patient.email
        user -> user.email
      end

    %{
      id: invitation.id,
      team_id: invitation.team_id,
      user_id: invitation.user_id,
      patient_id: invitation.patient_id,
      email: email,
      invite_token: invitation.invite_token,
      accepted: invitation.accepted
    }
  end
end
