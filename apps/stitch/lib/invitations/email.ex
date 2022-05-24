defmodule Stitch.Invitation.Email do
  @moduledoc """
  Handles email for all user invitation features.
  """

  import Bamboo.Email
  # import Bamboo.MandrillHelper

  @doc """
  Sends a team invite email to the user, with personal information
  of who invited him to the team.
  """
  def team_invitation(inviter_name, invitation) do
    new_email()
    |> text_body("""
    inviterName: #{inviter_name}
    inviterOrg: #{invitation.team.name}
    receiverEmail: #{invitation.user.email}
    joinTeamUrl: https://#{invitation.team.slug}.#{System.get_env("STITCH_CONNECT_APP_HOST")}/invitations/accept/#{invitation.invite_token}
    """)
    |> to(invitation.user.email)
    |> from({"InvoChat", "support@#{System.get_env("MAILGUN_DOMAIN")}"})
    |> subject("Join Your Team")
  end
end
