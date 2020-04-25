defmodule Stitch.PatientEmail do
  @moduledoc """
  Sets up and sends patient emails.

  Invite:
  - Initial Invitataion
  - Invite Reminders

  Auth:
  - Find Team Email
  - Reset Pasword Email
  """

  use Bamboo.Phoenix, view: Stitch.EmailView
  import Bamboo.Email

  @from_address {"Stitch", "hello@#{System.get_env("MAILGUN_DOMAIN")}"}

  def send_reset_password(patient, reset_link) do
    setup_auth_email(patient.email, "Stitch Health Password Reset")
    |> assign(:reset_link, reset_link)
    |> render("email/patient_reset_password.html")
    |> Stitch.NewMailer.deliver_now()
  end

  def send_find_team(email, token) do
    setup_auth_email(email, "Find Your Stitch Carespace")
    |> assign(:url, "#{Stitch.Web.Endpoint.url()}/patient/find-your-team/#{token.token}")
    |> render("email/patient_find_team.html")
    |> Stitch.NewMailer.deliver_now()
  end

  def send_invitation(patient, invitation) do
    invitation = Stitch.Repo.preload(invitation, :team)

    setup_invite_email(invitation, patient)
    |> render("email/patient_invite.html")
    |> Stitch.NewMailer.deliver_now()
  end

  def send_reminder(patient, invitation) do
    invitation = Stitch.Repo.preload(invitation, :team)

    setup_invite_email(invitation, patient)
    |> render("email/patient_invite_reminder.html")
    |> Stitch.NewMailer.deliver_now()
  end

  defp setup_auth_email(email, subject_line) do
    new_email()
    |> from(@from_address)
    |> subject(subject_line)
    |> assign(:subject, subject_line)
    |> to([System.get_env("MAILGUN_EMAIL_OVERRIDE") || email])
    |> assign(:patient_email, email)
    |> put_html_layout({Stitch.EmailView, "layout/email.html"})
  end

  defp setup_invite_email(invitation, patient) do
    subject_line = "#{invitation.team.name} has messaged you on Stitch"
    join_link = make_join_link(invitation.team.slug, invitation.invite_token)

    new_email()
    |> from(@from_address)
    |> to([System.get_env("MAILGUN_EMAIL_OVERRIDE") || patient.email])
    |> subject(subject_line)
    |> assign(:subject, subject_line)
    |> assign(:patient_email, patient.email)
    |> assign(:join_link, join_link)
    |> put_html_layout({Stitch.EmailView, "layout/email.html"})
  end

  defp make_join_link(slug, token) do
    "https://#{slug}.#{System.get_env("STITCH_CONNECT_APP_HOST")}/patient/invitations/accept/#{token}"
  end
end
