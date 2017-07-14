defmodule Stitch.User.Onboarding.Email do
  import Bamboo.Email
  import Bamboo.MandrillHelper

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

  def team_invitation(inviter_name, team_name, user) do
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
        "content": team_name
      },
      %{
        "name": "receiverEmail",
        "content": user.email
      },
      %{
        "name": "joinTeamUrl",
        "content": "https://foobar.com/#{user.invite_token}"
      },
    ])
    |> Stitch.Mailer.deliver_later
  end
end