defmodule Stitch.FindYourTeam do
  alias Stitch.Repo
  alias Stitch.FindYourTeam.Token

  import Bamboo.Email
  import Bamboo.MandrillHelper

  def create_or_get_token!(email) do
    changeset =
      %Token{}
      |> Token.changeset(%{email: email, token: Stitch.Rand.token(12)})

    case Repo.insert(changeset) do
      {:ok, token} ->
        token
      {:error, %{errors: [email: {"has already been taken", []}]}} ->
        Repo.get_by!(Token, email: email)
    end
  end

  def delete_token(%Token{} = token) do
    Repo.delete(token)
  end

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

  def get_by_token(token) do
    Repo.get_by(Token, token: token)
  end
end
