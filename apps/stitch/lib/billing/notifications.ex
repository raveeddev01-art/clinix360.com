defmodule Stitch.Billing.Notifications do
  @moduledoc """
  Handles sending email notifications about relevant billing events.
  """
  import Bamboo.Email
  import Bamboo.MandrillHelper
  alias Stitch.Accounts.User
  alias Stitch.Team
  alias Stitch.Mailer

  @doc """
  Sends an email that a payment was charged successfully.
  """
  def send_successful_payment(%User{email: email_address, first_name: name}, %Team{name: team_name}) do
    template_vars = [%{
      "*|orgName|*" => team_name,
      "*|receiverFirstName|*" => name
    }]

    new_email()
    |> template("Payment Monthly Invoice (Connect)", template_vars)
    |> to(email_address)
    |> from("support@teamstitch.com")
    |> subject("Stitch Payment Received")
    |> Mailer.deliver_later()
  end
end
