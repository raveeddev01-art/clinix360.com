defmodule Stitch.Contact.Email do
  @moduledoc """
  Handles email for contact us feature.
  """

  import Bamboo.Email

  @doc """
  Sends an email to support intimating about a contact request
  """
  def contact_email(name, email, help) do
    new_email()
    |> text_body("""
    We recieved a new contact Request,
    Name: #{name}
    Email: #{email}
    Message: #{help}
    """)
    |> to(System.get_env("MAILGUN_EMAIL_OVERRIDE") ||  "support@#{System.get_env("MAILGUN_DOMAIN")}")
    |> from({"InvoCom", "support@#{System.get_env("MAILGUN_DOMAIN")}"})
    |> subject("Contact request")
  end
end
