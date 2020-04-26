defmodule Stitch.FindYourTeam.Email do
  @moduledoc """
  Handles email for find-your-team features.
  """

  import Bamboo.Email
  import Bamboo.MandrillHelper

  alias Stitch.FindYourTeam.Token

  @doc """
  Sends an email to the user that allows them to log in to any
  of their teams.
  """

  @spec email(Token.t, binary) :: Bamboo.Email.t
  def email(%Token{} = token, endpoint_base_url) do
    new_email()
    |> to(token.email)
    |> from({"Stitch", "support@teamstitch.com"})
    |> subject("Find Your Team")
    |> text_body("Hit your temam here: #{endpoint_base_url}/find-your-team/#{token.token}")
    |> Stitch.NewMailer.deliver_now()
  end
end
