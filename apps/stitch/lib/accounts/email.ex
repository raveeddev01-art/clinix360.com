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
  Takes an array of messages with preloaded groups and users
  """
  def pack_messages(messages) do
    messages
    |> Enum.reduce(%{}, fn (message, acc) ->
      messages = Map.get(acc, message.group.id, [])
      Map.put(acc, message.group.id, [message|messages])
    end)
    |> Enum.map(fn {group_id, messages} ->
      [message|_] = messages
      %{
        "group_name" => message.group.name,
        "messages" => messages |> Enum.reverse |> Enum.map(fn message ->
          %{
            "author_name" => "#{message.user.first_name} #{message.user.last_name}",
            "time" => format_datetime(message.inserted_at),
            "message_text" => message.text_content,
          }
        end)
      }
    end)
  end

  @doc """
      "03:06 PM, September 4"
  """
  def format_datetime(datetime) do
    Timex.format!(datetime, "{0h12}:{m} {AM}, {Mfull} {D}")
  end

  @doc """
      "September 13, 2017 at 08:03 PM"
  """
  def format_datetime_subject(datetime) do
    Timex.format!(datetime, "{Mfull} {D}, {YYYY} at {0h12}:{m} {AM}")
  end

  def new_messages(user, team, messages) do
    new_email
    |> template("Unread messages")
    |> to(Application.get_env(:stitch, Stitch)[:recipient_email])
    |> from(Application.get_env(:stitch, Stitch)[:sender_email])
    |> subject("[Stitch Connect] Notifications from the #{team.name} team for #{format_datetime_subject(DateTime.utc_now)}")
    |> put_param("merge_language", "handlebars")
    |> put_param("global_merge_vars", [
      %{
        "name" => "full_name",
        "content": "#{user.first_name} #{user.last_name}"
      },
      %{
        "name": "team_name",
        "content": team.name
      },
      %{
        "name": "groups",
        "content": pack_messages(messages)
      }
    ])
  end
end
