defmodule Stitch.Accounts.Email do
  @moduledoc """
  Handles email for all user account actions.
  """

  use Bamboo.Phoenix, view: Stitch.EmailView
  import Bamboo.Email
  alias Stitch.Accounts.{User, Role}

  @guest_roles Role.guests()
  @from_address {"InvoCom", "hello@#{System.get_env("MAILGUN_DOMAIN")}"}

  @doc """
  Sends confirmation code email to the user.
  """
  def confirmation_code_email(user) do
    # code looks like "123-456" in email only
    code_string =
      String.to_charlist(user.confirmation_code)
      |> List.insert_at(3, "-")
      |> List.to_string()

    new_email()
    |> text_body("Your confirmation code is #{code_string}")
    |> to(System.get_env("MAILGUN_EMAIL_OVERRIDE") || user.email)
    |> from(@from_address)
    |> subject("InvoCom confirmation code: #{code_string}")
    |> Stitch.NewMailer.deliver_now()
  end

  @doc """
  Sends the password reset request
  """
  @spec reset_password_email(User.t(), binary) :: Bamboo.Email.t()
  def reset_password_email(user, reset_url) do
    new_email()
    |> to(user.email)
    |> from(@from_address)
    |> subject("Reset Your Password")
    |> text_body("Hello #{user.first_name}
    Hit to reset your password: #{reset_url}
    ")
    |> Stitch.NewMailer.deliver_now()
  end

  def role_changed_email(%User{email: to_address, first_name: first_name}, [old_role], [new_role]) do
    new_email()
    |> to(to_address)
    |> from(@from_address)
    |> subject(role_change_subject(old_role, new_role))
    |> assign(:first_name, first_name)
    |> assign(:old_role, Role.display_name(old_role))
    |> assign(:new_role, "#{Role.display_name(new_role)} <a>Hello Brother</a>")
    |> render("email/role_change.html")
    |> Stitch.NewMailer.deliver_now()
  end

  defp role_change_subject(old_role, new_role)
       when old_role in @guest_roles and new_role in @guest_roles,
       do: "Guest Status Changed"

  defp role_change_subject(old_role, _new_role) when old_role in @guest_roles, do: "Guest Removed"

  defp role_change_subject(_old_role, new_role) when new_role in @guest_roles,
    do: "New Guest Added"

  @doc """
  Sends email to user requesting them to reset their temporary password by
  linking them to the normal reset password page for their subdomain.
  """
  @spec temporary_password_reset(Stitch.Accounts.User.t(), binary) :: {:ok}
  def temporary_password_reset(user, reset_url) do
    new_email()
    |> to(user.email)
    |> from({"InvoCom", "support@#{System.get_env("MAILGUN_DOMAIN")}"})
    |> subject("ACTION REQUIRED: Please reset your InvoCom password")
    |> text_body("Hello #{user.first_name}
    Please hit the link to chnage password #{reset_url}
    ")
    |> Stitch.NewMailer.deliver_now()
  end

  def unread_messages_email([], _team), do: nil

  def unread_messages_email(recipients, %Stitch.Team{name: team_name}) do
    # new_email()
    # |> template("Message Waiting - Offline Email (Connect)")
    # |> to(Enum.map(recipients, & &1.email))
    # |> from(@from_address)
    # |> subject("[Stitch Connect] Notifications from #{team_name} *|userTime|*")
    # |> put_param("merge_vars", Enum.map(recipients, &unread_messages_for_recipient/1))
    # |> Stitch.NewMailer.deliver_now()
  end

  defp unread_messages_for_recipient(%{
         timezone: timezone,
         email: email,
         first_name: first_name,
         message_count: message_count,
         login_url: login_url
       }) do
    inflected_message = if message_count == 1, do: "message", else: "messages"

    vars = [
      %{name: "receiverFirstName", content: first_name},
      %{name: "unreadTotal", content: "#{message_count}"},
      %{name: "singularMessage", content: inflected_message},
      %{name: "receiverEmail", content: email},
      %{name: "loginUrl", content: login_url},
      %{name: "userTime", content: format_datetime_subject(timezone)}
    ]

    %{rcpt: email, vars: vars}
  end

  defp format_datetime_subject(timezone) do
    if timezone && Timex.Timezone.exists?(timezone) do
      datetime = Timex.Timezone.convert(DateTime.utc_now(), timezone)
      # September 13, 2017 at 08:03 PM"
      time = Timex.format!(datetime, "{Mfull} {D}, {YYYY} at {0h12}:{m} {AM}")
      "for #{time}"
    else
      ""
    end
  end
end
