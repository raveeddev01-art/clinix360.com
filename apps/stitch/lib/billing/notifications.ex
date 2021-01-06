defmodule Stitch.Billing.Notifications do
  @moduledoc """
  Handles sending email notifications about relevant billing events.
  """
  use Bamboo.Phoenix, view: Stitch.EmailView
  import Bamboo.Email

  alias Stitch.Accounts.User
  alias Stitch.Team

  @doc """
  Sends an email for a successful payment.
  """
  def send_successful_payment(%User{email: email_address, first_name: first_name}, %Team{name: team_name}) do
    new_email()
    |> to(email_address)
    |> from({"InvoCom", "support@#{System.get_env("MAILGUN_DOMAIN")}"})
    |> subject("InvoCom Payment Received")
    |> assign(:first_name, first_name)
    |> assign(:team_name, team_name)
    |> render("email/payment_received.html")
    |> Stitch.NewMailer.deliver_now()
  end

  @doc """
  Sends an email for a failed payment.
  """
  def send_failed_payment(%User{} = user, %Team{} = team, plan_name, days_until_retry) do
    new_email()
    |> to(user.email)
    |> from({"InvoCom", "support@#{System.get_env("MAILGUN_DOMAIN")}"})
    |> subject("InvoCom Payment Failed")
    |> assign(:first_name, user.first_name)
    |> assign(:team_name, team.name)
    |> assign(:plan_name, plan_name)
    |> assign(:retry_days, days_until_retry)
    |> render("email/payment_failed.html")
    |> Stitch.NewMailer.deliver_now()
  end
end
