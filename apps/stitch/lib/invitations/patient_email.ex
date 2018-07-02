defmodule Stitch.Invitation.PatientEmail do
  @moduledoc """
  Handles email for all patient invitation features.
  """

  use Bamboo.Phoenix, view: Stitch.EmailView
  import Bamboo.Email

  @from_address {"Stitch", "hello@mail.teamstitch.com"}

  def send_invitation(patient, invitation) do
    invitation = Stitch.Repo.preload(invitation, :team)

    setup_email(invitation, patient)
    |> render("email/patient_invite.html")
    |> Stitch.NewMailer.deliver_later()
  end

  def send_reminder(patient, invitation) do
    invitation = Stitch.Repo.preload(invitation, :team)

    setup_email(invitation, patient)
    |> render("email/patient_invite_reminder.html")
    |> Stitch.NewMailer.deliver_later()
  end

  defp setup_email(invitation, patient) do
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
    "https://#{slug}.#{System.get_env("APP_HOST")}/patient/invitations/accept/#{token}"
  end
end
