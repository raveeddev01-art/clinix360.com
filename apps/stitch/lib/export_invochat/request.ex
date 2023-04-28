defmodule Stitch.ExportInvochat.Request do
  use HTTPoison.Base
  @base_url "https://source-im.invo.zone/api"
  @headers [
    {"Authorization", "Bearer huokuoz633yupcqi9zti4ywdna"},
    {"Content-type", "application/json"}
  ]

  def post_api(url, body) do
    (@base_url <> url)
    |> IO.inspect(label: " url.......")
    |> send_req(body)
    |> decode_response()
  end

  def send_req(url, body) do
    req_body = Poison.encode!(body)

    case HTTPoison.post(url, req_body, @headers, recv_timeout: 80_000)
         |> IO.inspect(label: "Hitting") do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        body

      {:ok, %HTTPoison.Response{status_code: 201, body: body}} ->
        body

      {:ok, %HTTPoison.Response{status_code: 202, body: body}} ->
        body

      {:ok, %HTTPoison.Response{status_code: 204, body: body}} ->
        body

      {:error, :timeout} ->
        {:error, "Timeout"}

      {:error, %HTTPoison.Error{reason: reason}} ->
        reason

      {:ok, %HTTPoison.Response{status_code: 400, body: body}} ->
        body

      {:ok, %HTTPoison.Response{status_code: 401, body: body}} ->
        body

      {:ok, %HTTPoison.Response{status_code: 402, body: body}} ->
        body

      {:ok, %HTTPoison.Response{status_code: 403, body: body}} ->
        body

      {:ok, %HTTPoison.Response{status_code: 404, body: body}} ->
        body

      {:ok, %HTTPoison.Response{status_code: 415, body: body}} ->
        body

      {:ok, %HTTPoison.Response{status_code: 422, body: body}} ->
        body

      {:ok, %HTTPoison.Response{status_code: 429, body: body}} ->
        body

      {:ok, %HTTPoison.Response{status_code: 500, body: body}} ->
        body

      {:ok, %HTTPoison.Response{status_code: 502, body: body}} ->
        body

      {:ok, %HTTPoison.Response{status_code: 503, body: body}} ->
        body

      {:ok, %HTTPoison.Response{status_code: 504, body: body}} ->
        body

      error ->
        error
    end
  end

  def decode_response(response) do
    case Poison.decode(response) do
      {:ok, result} -> result
      {:error, result} -> {:error, result}
    end
  end
end
