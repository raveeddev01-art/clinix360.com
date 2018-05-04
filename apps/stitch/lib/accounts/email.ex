defmodule Stitch.Accounts.Email do
  @moduledoc """
  Handles email for all user account actions.
  """

  import Bamboo.Email
  import Bamboo.MandrillHelper
  alias Stitch.Accounts.{User, Role}

  @guest_roles Role.guests()
  @from_address {"Stitch", "support@teamstitch.com"}

  @doc """
  Sends confirmation code email to the user.
  """
  def confirmation_code_email(user) do
    new_email()
    |> template("Sign-Up 1: Authenticate Provider Code (Connect)")
    |> to(user.email)
    |> from(@from_address)
    |> subject("Confirm your email")
    |> put_param("global_merge_vars", [
      %{
        name: "confirmationCode",
        # code looks like "123 - 456" in email only
        content:
          String.to_charlist(user.confirmation_code)
          |> List.insert_at(3, " - ")
          |> List.to_string()
      }
    ])
    |> Stitch.Mailer.deliver_later()
  end

  @doc """
  Sends the password reset request
  """
  @spec reset_password_email(User.t(), binary) :: Bamboo.Email.t()
  def reset_password_email(user, reset_url) do
    new_email()
    |> template("Password Reset (Connect)")
    |> to(user.email)
    |> from(@from_address)
    |> subject("Reset Your Password")
    |> put_param("global_merge_vars", [
      %{
        name: "resetPasswordUrl",
        content: reset_url
      },
      %{
        name: "receiverFirstName",
        content: user.first_name
      }
    ])
    |> Stitch.Mailer.deliver_later()
  end

  def role_changed_email(%User{email: to_address, first_name: first_name}, [old_role], [new_role]) do
    new_email()
    |> template("Payment Role Change (Phoenix)")
    |> to(to_address)
    |> from(@from_address)
    |> subject(role_change_subject(old_role, new_role))
    |> put_param("global_merge_vars", [
      %{
        name: "receiverFirstName",
        content: first_name
      },
      %{
        name: "previousRole",
        content: Role.display_name(old_role)
      },
      %{
        name: "newRole",
        content: Role.display_name(new_role)
      }
    ])
    |> Stitch.Mailer.deliver_later()
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
    |> template("Security Password Reset (Phoenix)")
    |> to(user.email)
    |> from({"Stitch", "support@teamstitch.com"})
    |> subject("ACTION REQUIRED: Please reset your Stitch password")
    |> put_param("global_merge_vars", [
      %{
        name: "resetPasswordUrl",
        content: reset_url
      },
      %{
        name: "receiverFirstName",
        content: user.first_name
      }
    ])
    |> Stitch.Mailer.deliver_later()
  end
end
