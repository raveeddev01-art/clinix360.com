defmodule Stitch.Invitation.Email do
  @moduledoc """
  Handles email for all user invitation features.
  """

  import Bamboo.Email
  import Bamboo.MandrillHelper

  @doc """
  Sends a team invite email to the user, with personal information
  of who invited him to the team.
  """
  def team_invitation(inviter_name, invitation) do
    new_email()
    |> template("Sign-up 3: You are Invited (Connect)")
    |> to(invitation.user.email)
    |> from("welcome@teamstitch.com")
    |> subject("Stitch Connect - Team Invite")
    |> put_param("global_merge_vars", [
      %{
        "name": "inviterName",
        "content": inviter_name
      },
      %{
        "name": "inviterOrg",
        "content": invitation.team.name
      },
      %{
        "name": "receiverEmail",
        "content": invitation.user.email
      },
      %{
        "name": "joinTeamUrl",
        "content": "https://#{invitation.team.slug}.teamstitchapp.com/invitations/accept/#{invitation.invite_token}"
      },
    ])
    |> Stitch.Mailer.deliver_later
  end
end