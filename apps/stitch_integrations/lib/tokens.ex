defmodule StitchIntegrations.Tokens do
  @moduledoc """
  Handles tokens for all of our EHR integrations using ETS
  tables to keep track of expiration times and values.
  """

  @doc """
  Saves the token for an EHR along with it's expiration time.

  ## Examples

      iex> StitchIntegrations.Tokens.set_token("athenahealth", "abcdef", 1520619281)
      {:ok, "abcdef"}

  """
  @spec set_token(binary, binary, number) :: {:ok, binary} | {:error, binary}
  def set_token("", _, _), do: {:error, "Invalid ehr_name"}
  def set_token(_, "", _), do: {:error, "Invalid token"}

  def set_token(_, _, expiration_in_unix) when expiration_in_unix <= 0,
    do: {:error, "Invalid expiration_in_unix"}

  def set_token(ehr_name, token, expiration_in_unix)
      when is_binary(ehr_name) and is_binary(token) and is_number(expiration_in_unix) do
    bucket = token_expirations_bucket()

    now_in_unix = DateTime.utc_now() |> DateTime.to_unix()

    if expiration_in_unix < now_in_unix do
      {:error, "Invalid expiration_in_unix"}
    else
      :ets.insert(bucket, {ehr_name, token, expiration_in_unix})
      {:ok, token}
    end
  end

  def set_token(_, _, _), do: {:error, "Invalid parameters"}

  @doc """
  Returns the token for a given EHR integration.

  ## Examples

      iex> StitchIntegrations.get_token("athenahealth")
      {:ok, "abcdef"}

      iex> StitchIntegrations.get_token("rao08uy08")
      {:error, "Token for rao08uy08 not found"}

  """
  @spec get_token(binary) :: {:ok, binary} | {:error, binary}
  def get_token(""), do: {:error, "ehr_name can't be empty"}

  def get_token(ehr_name) when is_binary(ehr_name) do
    bucket = token_expirations_bucket()

    case :ets.lookup(bucket, ehr_name) do
      [{_ehr_name, token, _expiration_in_unix} | _] ->
        {:ok, token}

      _ ->
        {:error, "Token for #{ehr_name} not found"}
    end
  end

  def get_token(_), do: {:error, "ehr_name must be a string"}

  @doc """
  Returns whether an EHR integration's token has expired and needs a refresh.

  ## Examples

      iex> StitchIntegrations.Tokens.expired?("athenahealth")
      true

      iex> StitchIntegrations.Tokens.expired?("athenahealth")
      false

      iex> StitchIntegrations.Tokens.expired?("athenahealth")
      {:error, "Token doesn't exist for athenahealth"}

  """
  @spec expired?(binary) :: boolean | {:error, binary}
  def expired?(""), do: {:error, "ehr_name can't be empty"}

  def expired?(ehr_name) when is_binary(ehr_name) do
    bucket = token_expirations_bucket()

    case :ets.lookup(bucket, ehr_name) do
      [{_ehr_name, _token, expiration_in_unix} | _] ->
        {:ok, expiration} = DateTime.from_unix(expiration_in_unix)
        :lt == DateTime.compare(expiration, DateTime.utc_now())

      _ ->
        {:error, "Token doesn't exist for #{ehr_name}"}
    end
  end

  def expired?(_), do: {:error, "ehr_name must be a string"}

  defp token_expirations_bucket do
    case :ets.info(:token_expirations) do
      :undefined ->
        :ets.new(:token_expirations, [:set, :protected, :named_table])
        :token_expirations

      _ ->
        :token_expirations
    end
  end
end
