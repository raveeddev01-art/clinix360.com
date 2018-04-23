defmodule StitchIntegrations.DrChrono.Token do
  require Logger
  import Ecto.Query
  alias Stitch.Repo
  alias Stitch.Integration
  alias StitchIntegrations.DrChrono

  def for_integration(integration) do
    unix_now = DateTime.utc_now() |> DateTime.to_unix()

    if integration.credentials["expiration_in_unix"] <= unix_now do
      Logger.info("Token's expired, refreshing it.")
      # Token has expired, we need to refresh it, and update it in
      # the database.
      {:ok, response_values} = refresh_token(integration.credentials["refresh_token"])

      new_credentials = Map.merge(integration.credentials, response_values)
      Integration.update(integration, %{credentials: new_credentials})

      {:ok, new_credentials[:access_token]}
    else
      Logger.info("Token is still valid, return existing.")
      # Token is still valid, let's just use it.
      token = integration.credentials["access_token"]
      {:ok, token}
    end
  end

  def create_access_token(integration, code) do
    applicationHost = Application.fetch_env!(:stitch_connect, :application_host)
    applicationScheme = Application.fetch_env!(:stitch_connect, :application_scheme)

    # https://bkkilaru.drchrono.com/api-docs/v2016_06/documentation#otoken
    params =
      [
        "code=#{code}",
        "grant_type=authorization_code",
        "redirect_uri=#{applicationScheme}#{applicationHost}/_oauth/drchrono/#{
          integration.webhook_token
        }",
        "client_id=#{integration.credentials["clientId"]}",
        "client_secret=#{integration.credentials["clientSecret"]}"
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

        new_credentials = Map.merge(integration.credentials, response_values)

        {:ok, _integration} =
          Integration.update(integration, %{authenticated: true, credentials: new_credentials})

        {:ok, new_credentials}

      {:error, error} ->
        {:error, error}
    end
  end

  def refresh_token(integration) do
    applicationHost = Application.fetch_env!(:stitch_connect, :application_host)
    applicationScheme = Application.fetch_env!(:stitch_connect, :application_scheme)

    params =
      [
        "refresh_token=#{integration.credentials["refreshToken"]}",
        "grant_type=refresh_token",
        "redirect_uri=#{applicationScheme}#{applicationHost}/_oauth/drchrono/#{
          integration.webhook_token
        }",
        "client_id=#{integration.credentials["clientId"]}",
        "client_secret=#{integration.credentials["clientSecret"]}"
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
