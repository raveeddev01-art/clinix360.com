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
    |> template("Find Your Team")
    |> to(token.email)
    |> from({"Stitch", "support@teamstitch.com"})
    |> subject("Find Your Team")
    |> put_param("global_merge_vars", [
      %{
        "name": "findYourTeam",
        "content": "#{endpoint_base_url}/find-your-team/#{token.token}"
      },
    ])
    |> Stitch.Mailer.deliver_later
  end
end