defmodule StitchIntegrations.DrChrono.Token do
  require Logger
  import Ecto.Query
  alias Stitch.Repo
  alias Stitch.Integration
  alias StitchIntegrations.DrChrono

  def token(team_id) do
    query =
      from(
        i in Integration,
        where: i.team_id == ^team_id,
        where: i.name == "drchrono",
        select: i
      )

    integration = Repo.one(query)

    unix_now = DateTime.utc_now() |> DateTime.to_unix()

    if integration.settings["expiration_in_unix"] <= unix_now do
      # Token has expired, we need to refresh it, and update it in
      # the database.
      {:ok, response_values} = refresh_token(integration.settings["refresh_token"])

      new_settings =
        integration.settings
        |> Map.put("access_token", response_values[:access_token])
        |> Map.put("expiration_in_unix", response_values[:expiration_in_unix])
        |> Map.put("refresh_token", response_values[:refresh_token])

      # Save the settings for this team's DrChrono integration.
      DrChrono.insert_or_update_integration(team_id, new_settings)

      {:ok, response_values[:access_token]}
    else
      # Token is still valid, let's just use it.
      {:ok, integration.settings["access_token"]}
    end
  end

  def get_access_token(code) do
    applicationHost = Application.fetch_env!(:stitch_connect, :application_host)
    applicationScheme = Application.fetch_env!(:stitch_connect, :application_scheme)

    # https://bkkilaru.drchrono.com/api-docs/v2016_06/documentation#otoken
    params =
      [
        "code=#{code}",
        "grant_type=authorization_code",
        "redirect_uri=#{applicationScheme}#{applicationHost}/_oauth/drchrono",
        "client_id=#{System.get_env("DRCHRONO_CLIENT_ID")}",
        "client_secret=#{System.get_env("DRCHRONO_SECRET")}"
      ]
      |> Enum.join("&")

    response =
      HTTPoison.post("https://drchrono.com/o/token/", params, [
        {"Content-Type", "application/x-www-form-urlencoded"}
      ])

    case response do
      {:ok, response} ->
        response_json = Poison.decode!(response.body)

        expiration_in_unix =
          (DateTime.utc_now() |> DateTime.to_unix()) + response_json["expires_in"]

        response_values = %{
          access_token: response_json["access_token"],
          token_type: response_json["token_type"],
          refresh_token: response_json["refresh_token"],
          scope: response_json["scope"],
          expiration_in_unix: expiration_in_unix
        }

        {:ok, response_values}

      {:error, error} ->
        {:error, error}
    end
  end

  def refresh_token(refresh_token) do
    applicationHost = Application.fetch_env!(:stitch_connect, :application_host)
    applicationScheme = Application.fetch_env!(:stitch_connect, :application_scheme)

    params =
      [
        "refresh_token=#{refresh_token}",
        "grant_type=refresh_token",
        "redirect_uri=#{applicationScheme}#{applicationHost}/_oauth/drchrono",
        "client_id=#{System.get_env("DRCHRONO_CLIENT_ID")}",
        "client_secret=#{System.get_env("DRCHRONO_SECRET")}"
      ]
      |> Enum.join("&")

    response =
      HTTPoison.post("https://drchrono.com/o/token/", params, [
        {"Content-Type", "application/x-www-form-urlencoded"}
      ])

    case response do
      {:ok, response} ->
        response_json = Poison.decode!(response.body)

        expiration_in_unix =
          (DateTime.utc_now() |> DateTime.to_unix()) + response_json["expires_in"]

        response_values = %{
          access_token: response_json["access_token"],
          refresh_token: response_json["refresh_token"],
          expiration_in_unix: expiration_in_unix
        }

        {:ok, response_values}

      {:error, error} ->
        {:error, error}
    end
  end
end
