defmodule Stitch.FindYourTeam do
  alias Stitch.Repo
  alias Stitch.FindYourTeam.Token

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
    Bamboo.Email.new_email(
      to: token.email,
      from: {"Stitch", "support@teamstitch.com"},
      subject: "Find your team",
      html_body: "#{endpoint_base_url}/find-your-team/#{token.token}",
      text_body: "#{endpoint_base_url}/find-your-team/#{token.token}"
    )
  end

  def get_by_token(token) do
    Repo.get_by(Token, token: token)
  end
end
