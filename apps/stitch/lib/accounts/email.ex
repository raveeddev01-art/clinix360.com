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
end