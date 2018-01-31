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
  def send_successful_payment(%User{email: email_address, first_name: first_name}, %Team{name: team_name}) do
    new_email()
    |> template("Payment Monthly Invoice (Connect)")
    |> to(email_address)
    |> from({"Stitch", "support@teamstitch.com"})
    |> subject("Stitch Payment Received")
    |> put_param("global_merge_vars", [
      %{
        name: "orgName",
        content: team_name
      },
      %{
        name: "receiverFirstName",
        content: first_name
      }
    ])
    |> Mailer.deliver_later()
  end

  @doc """
  Sends an email for a failed payment.
  """
  def send_failed_payment(%User{} = user, %Team{} = team, plan_name, days_until_retry) do
    new_email()
    |> template("Payment Subscription Failed (Connect)")
    |> to(user.email)
    |> from({"Stitch", "support@teamstitch.com"})
    |> subject("Stitch Payment Failed")
    |> put_param("global_merge_vars", [
      %{
        name: "orgName",
        content: team.name,
      },
      %{
        name: "receiverFirstName",
        content: user.first_name
      },
      %{
        name: "plan",
        content: plan_name
      },
      %{
        name: "retryDays",
        content: days_until_retry
      }
    ])
    |> Mailer.deliver_later()
  end
end
