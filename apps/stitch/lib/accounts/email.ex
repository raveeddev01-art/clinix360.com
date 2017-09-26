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
  end

  @doc """
  Sends the password reset request
  """
  def reset_password_email(user, reset_url) do
    new_email()
    |> template("Password Reset (Connect)")
    |> to(user.email)
    |> from("support@teamstitch.com")
    |> subject("Reset Password Requests")
    |> put_param("global_merge_vars", [
      %{
        "name": "resetPasswordUrl",
         "content": reset_url
      },
      %{
         "name": "receiverFirstName",
         "content": user.first_name
      }
    ])
    |> Stitch.Mailer.deliver_later
  end

  @doc """
      "September 13, 2017 at 08:03 PM"
  """
  def format_datetime_subject(datetime) do
    Timex.format!(datetime, "{Mfull} {D}, {YYYY} at {0h12}:{m} {AM}")
  end

  def unread_messages(user, team, message_count) do
    inflected_message = if message_count == 1, do: "message", else: "messages"

    new_email
    |> template("Unread messages")
    |> to(user.email)
    |> from("welcome@teamstitch.com")
    |> subject("[Stitch Connect] Notifications from the #{team.name} team for #{format_datetime_subject(DateTime.utc_now)}")
    |> put_param("global_merge_vars", [
      %{
        "name" => "receiverFirstName",
        "content": user.first_name,
      },
      %{
        "name": "unreadTotal",
        "content": message_count,
      },
      %{
        "name": "singularMessage",
        "content": inflected_message
      },
      %{
        "name": "receiverEmail",
        "content": user.email,
      }
    ])
  end
end
