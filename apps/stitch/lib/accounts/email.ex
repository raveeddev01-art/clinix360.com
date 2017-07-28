defmodule Stitch.Accounts.Email do
  @moduledoc """
  Handles email for all user account actions.
  """

  import Bamboo.Email
  import Bamboo.MandrillHelper

  @doc """
  Sends confirmation code email to the user.
  """
  def confirmation_code_email(user) do
    new_email()
    |> template("Sign-Up 1: Authenticate Provider Code (Connect)")
    |> to(user.email)
    |> from("welcome@teamstitch.com")
    |> subject("Confirm your email")
    |> put_param("global_merge_vars", [
      %{
        "name": "confirmationCode",
        "content": user.confirmation_code
      }
    ])
    |> Stitch.Mailer.deliver_later
  end #omarivera@lightspeed-electric.com

  @doc """
  Sends a team invite email to the user, with personal information
  of who invited him to the team.
  """
  def team_invitation(inviter_name, team, user) do
    new_email()
    |> template("Sign-up 3: You are Invited (Connect)")
    |> to(user.email)
    |> from("welcome@teamstitch.com")
    |> subject("Stitch Connect - Team Invite")
    |> put_param("global_merge_vars", [
      %{
        "name": "inviterName",
        "content": inviter_name
      },
      %{
        "name": "inviterOrg",
        "content": team.name
      },
      %{
        "name": "receiverEmail",
        "content": user.email
      },
      %{
        "name": "joinTeamUrl",
        "content": "https://#{team.slug}.teamstitchapp.com/invitation/accept/#{user.invite_token}"
      },
    ])
    |> Stitch.Mailer.deliver_later
  end
end