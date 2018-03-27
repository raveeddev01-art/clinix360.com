defmodule StitchIntegrations.DrChrono do
  alias Stitch.{Accounts.User, Bot, Integration}
  alias Stitch.Repo
  import Ecto.Query
  alias StitchIntegrations.DrChrono.Token
  require Logger

  def handle_webhook(event_type, params) do
    IO.inspect(event_type)
    IO.inspect(params)
  end

  def init_integration(team_id, code) do
    Logger.info("[dr-chrono] [team-#{team_id}] Initialize integration.")

    {:ok, response_values} = Token.get_access_token(code)
    Logger.info("[dr-chrono] [team-#{team_id}] Got access token from API.")

    {:ok, integration} = insert_or_update_integration(team_id, response_values)

    Logger.info("[dr-chrono] [team-#{team_id}] Created Integration settings in DB.")

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
end
