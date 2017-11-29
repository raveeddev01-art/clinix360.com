defmodule Stitch.Twilio do
  use HTTPoison.Base

  @base_url "https://lookups.twilio.com/v1/PhoneNumbers/"
  @config Application.get_env(:stitch, :twilio)

  def lookup(phone_number) do
    case do_lookup(phone_number) do
      %{"status" => 404} ->
        :error
      _ ->
        :ok
    end
  end

  defp do_lookup(phone_number, query \\ []) do
    query_string = URI.encode_query(query)
    "#{@base_url}#{phone_number}?#{query_string}"
    |> HTTPoison.get!([], [hackney: auth_params()])
    |> parse()
  end

  defp parse(response) do
    Poison.decode!(response.body)
  end

  defp auth_params do
    [basic_auth: {@config.account_sid, @config.auth_token}]
  end
end