defmodule StitchIntegrations.DrChrono do
  alias Stitch.{Accounts.User, Bot, Integration}
  alias Stitch.Repo
  import Ecto.Query
  alias StitchIntegrations.DrChrono.Token

  def init_integration(team_id, code) do
    {:ok, response_values} = Token.get_access_token(code)
    {:ok, integration} = insert_or_update_integration(team_id, response_values)
    :ok
  end

  defp insert_or_update_integration(team_id, settings) do
    result =
      case Repo.get_by(Integration, team_id: team_id, name: "drchrono") do
        nil -> %Integration{}
        integration -> integration
      end
      |> Integration.changeset(%{
        team_id: team_id,
        name: "drchrono",
        settings: settings,
        enabled: true
      })
      |> Repo.insert_or_update()

    case result do
      {:ok, integration} ->
        {:ok, integration}

      {:error, changeset} ->
        {:error, "Couldn't update integration settings"}
    end
  end

  # def token(team_id) do
  #   integration =
  #     from(
  #       i in Integration,
  #       where: i.team_id == ^team_id,
  #       where: i.name == "drchrono",
  #       select: i
  #     )
  #     |> Repo.one!()

  #   case StitchEHR.Tokens.get_token("drchrono") do
  #     # If no key has been saved yet, just refresh it using accessToken.
  #     {:error, not_found} ->
  #       {:ok, response_values} = Token.refresh_token(integration.settings)
  #       {:ok, token} = StitchEHR.Tokens.set_token("drchrono", token, expiration_in_unix)
  #       token

  #     # If we have a key saved, check if it's expired and if so refresh the token.
  #     {:ok, token} ->
  #       if StitchEHR.Tokens.expired?("drchrono") do
  #         {token, expiration_in_unix} = refreshToken(integration.settings)
  #         {:ok, token} = StitchEHR.Tokens.set_token("drchrono", token, expiration_in_unix)
  #         token
  #       else
  #         token
  #       end
  #   end
  # end
end
