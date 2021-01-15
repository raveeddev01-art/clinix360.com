defmodule Stitch.Web.Api.V1.ContactController do
  use Stitch.Web, :controller
  alias Stitch.Contact.Email

  def contact(conn, %{"email" => email, "name" => name, "help" => help}) do
    Email.contact_email(name, email, help)
    render(conn, "success.json", success: true)
  end
end
