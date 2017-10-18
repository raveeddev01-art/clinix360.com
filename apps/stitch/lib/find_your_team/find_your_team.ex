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

  def email(%Token{} = token, endpoint_base_url) do
    Bamboo.Email.new_email(
      to: token.email,
      from: "support@teamstitch.com",
      subject: "Stitch - Find your team",
      html_body: "#{endpoint_base_url}/find-your-team/#{token.token}",
      text_body: "#{endpoint_base_url}/find-your-team/#{token.token}"
    )
  end
end
