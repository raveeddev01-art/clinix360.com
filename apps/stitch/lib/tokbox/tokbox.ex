defmodule Tokbox do
  @moduledoc """
  REST API wrapper to communicate with Tokbox signaling server.
  """

  require Logger

  @type opentok_response :: {:json, map()} | {:error, term}

  @default_algos ["HS256"]
  @endpoint "https://api.opentok.com"

  @role_publisher "publisher"
  @role_subscriber "subscriber"
  @role_moderator "moderator"

  @token_prefix "T1=="

  @doc """
  Create new WebRTC session.
  """
  @spec session_create() :: opentok_response
  def session_create do
    response =
      HTTPoison.post(
        @endpoint <> "/session/create",
        "{}",
        Accept: "application/json",
        "X-OPENTOK-AUTH": get_jwt(),
        "Content-Type": "application/x-www-form-urlencoded"
      )

    opentok_process_response(response)
  end

  @doc """
  Generate unique token to access session.
  """
  @spec generate_token(String.t(), Keyword.t()) :: String.t()
  def generate_token(session_id, opts \\ []) do
    query = %{
      "nonce" => nonce(16),
      "create_time" => timestamp(),
      "session_id" => session_id,
      "role" => Keyword.get(opts, :role, @role_publisher),
      "expire_time" => Keyword.get(opts, :expire_time, timestamp() + 3600),
      "connection_data" => Keyword.get(opts, :connection_data, "")
    }

    data_string = URI.encode_query(query)
    signature = sign_string(data_string, config(:secret))

    @token_prefix <> Base.encode64("partner_id=#{config(:key)}&sig=#{signature}:#{data_string}")
  end

  @doc """
  Generate JWT to access Tokbox API services.
  """
  @spec get_jwt() :: String.t()
  def get_jwt() do
    life_length = config(:ttl, 60 * 5)

    claims = %{
      jti: nonce(8),
      iat: timestamp(),
      iss: config(:key),
      ist: config(:iss, "project"),
      exp: timestamp() + life_length
    }

    {_, jwt} =
      nil
      |> jose_jwk
      |> JOSE.JWT.sign(jose_jws(%{}), claims)
      |> JOSE.JWS.compact()

    jwt
  end

  defp process_url(url) do
    @endpoint <> url
  end

  @spec process_request_headers(map() | Keyword.t()) :: [{binary, term}]
  defp process_request_headers(headers) when is_map(headers) do
    process_request_headers(Enum.into(headers, []))
  end

  defp process_request_headers(headers) do
    auth_headers = [
      {"X-OPENTOK-AUTH", get_jwt()},
      {"Accept", "application/json"}
    ]

    auth_headers ++ headers
  end

  @spec opentok_process_response(%HTTPoison.Response{}) :: opentok_response
  defp opentok_process_response({_, response}) do
    case response do
      %{status_code: 200, body: body} ->
        session_id = body |> Poison.decode!() |> List.first() |> Map.get("session_id")
        {:ok, session_id}

      _ ->
        Logger.error(fn -> "Tokbox query: #{inspect(response)}" end)
        {:error, response}
    end
  end

  @doc false
  def config, do: Application.get_env(:stitch, Tokbox)
  @doc false
  def config(key, default \\ nil),
    do: config() |> Keyword.get(key, default) |> resolve_config(default)

  defp allowed_algos, do: config(:allowed_algos, @default_algos)

  defp resolve_config({:system, var_name}, default),
    do: System.get_env(var_name) || default

  defp resolve_config(value, _default),
    do: value

  defp jose_jws(headers) do
    Map.merge(%{"alg" => hd(allowed_algos())}, headers)
  end

  defp jose_jwk(the_secret = %JOSE.JWK{}), do: the_secret
  defp jose_jwk(the_secret) when is_binary(the_secret), do: JOSE.JWK.from_oct(the_secret)
  defp jose_jwk(the_secret) when is_map(the_secret), do: JOSE.JWK.from_map(the_secret)
  defp jose_jwk({mod, fun}), do: jose_jwk(:erlang.apply(mod, fun, []))
  defp jose_jwk({mod, fun, args}), do: jose_jwk(:erlang.apply(mod, fun, args))
  defp jose_jwk(nil), do: jose_jwk(config(:secret) || false)
  defp jose_jwk(_), do: raise("TOKBOX_SECRET is missing environment variable.")

  defp timestamp() do
    :os.system_time(:seconds)
  end

  defp nonce(size) do
    size
    |> :crypto.strong_rand_bytes()
    |> Base.encode16()
  end

  @spec sign_string(String.t(), String.t()) :: String.t()
  defp sign_string(string, secret) do
    :sha
    |> :crypto.hmac(secret, string)
    |> Base.encode16()
    |> String.downcase()
  end
end
