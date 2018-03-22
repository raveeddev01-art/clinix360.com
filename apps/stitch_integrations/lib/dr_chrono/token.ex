defmodule StitchIntegrations.DrChrono.Token do
  def get_access_token(code) do
    # https://bkkilaru.drchrono.com/api-docs/v2016_06/documentation#otoken
    data =
      [
        "code=#{code}",
        "grant_type=authorization_code",
        "redirect_uri=https://localhost.app:4443/_oauth/drchrono",
        "client_id=#{System.get_env("DRCHRONO_CLIENT_ID")}",
        "client_secret=#{System.get_env("DRCHRONO_SECRET")}"
      ]
      |> Enum.join("&")

    response =
      HTTPoison.post("https://drchrono.com/o/token/", data, [
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
    data =
      [
        "refresh_token=#{refresh_token}",
        "grant_type=refresh_token",
        "redirect_uri=https://localhost.app:4443/_oauth/drchrono",
        "client_id=#{System.get_env("DRCHRONO_CLIENT_ID")}",
        "client_secret=#{System.get_env("DRCHRONO_SECRET")}"
      ]
      |> Enum.join("&")

    response =
      HTTPoison.post("https://drchrono.com/o/token/", data, [
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
