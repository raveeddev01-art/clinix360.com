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
  Sends an email for a successful payment.
  """
  def send_successful_payment(%User{email: email_address, first_name: name}, %Team{name: team_name}) do
    template_vars = [%{
      "*|orgName|*" => team_name,
      "*|receiverFirstName|*" => name
    }]

    new_email()
    |> template("Payment Monthly Invoice (Connect)", template_vars)
    |> to(email_address)
    |> from({"Stitch", "support@teamstitch.com"})
    |> subject("Stitch Payment Received")
    |> Mailer.deliver_later()
  end

  @doc """
  Sends an email for a failed payment.
  """
  def send_failed_payment(%User{} = user, %Team{} = team, plan_name, days_until_retry) do
    template_vars = [%{
      "*|orgName|*" => team.name,
      "*|receiverFirstName|*" => user.first_name,
      "*|plan|*" => plan_name,
      "*|retryDays|*" => days_until_retry
    }]

    new_email()
    |> template("Payment Subscription Failed (Connect)", template_vars)
    |> to(user.email)
    |> from({"Stitch", "support@teamstitch.com"})
    |> subject("Stitch Payment Failed")
    |> Mailer.deliver_later()
  end
end
