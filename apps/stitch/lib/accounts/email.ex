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
    |> from({"Stitch", "support@teamstitch.com"})
    |> subject("Confirm your email")
    |> put_param("global_merge_vars", [
      %{
        "name": "confirmationCode",
        "content": String.to_charlist(user.confirmation_code) |> List.insert_at(3, " - ") |> List.to_string # code looks like "123 - 456" in email only
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
    |> from({"Stitch", "support@teamstitch.com"})
    |> subject("Reset Your Password")
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

  def unread_messages_email([]), do: nil
  def unread_messages_email(recipients) do
    new_email()
    |> template("Message Waiting - Offline Email (Connect)")
    |> to(Enum.map(recipients, & &1.email))
    |> from({"Stitch", "support@teamstitch.com"})
    |> subject("[Stitch Connect] Notifications for #{format_datetime_subject(DateTime.utc_now)}")
    |> put_param("merge_vars", Enum.map(recipients, &unread_messages_for_recipient/1))
    |> Stitch.Mailer.deliver_later
  end

  defp unread_messages_for_recipient(%{email: email, first_name: first_name, message_count: message_count, login_url: login_url}) do
    inflected_message = if message_count == 1, do: "message", else: "messages"
    vars = [
      %{"name": "receiverFirstName", "content": first_name},
      %{"name": "unreadTotal", "content": "#{message_count}"},
      %{"name": "singularMessage", "content": inflected_message},
      %{"name": "receiverEmail", "content": email},
      %{"name": "loginUrl", "content": login_url}
    ]
    %{ rcpt: email, vars: vars }
  end

  defp format_datetime_subject(datetime) do
    # September 13, 2017 at 08:03 PM"
    Timex.format!(datetime, "{Mfull} {D}, {YYYY} at {0h12}:{m} {AM}")
  end
end
