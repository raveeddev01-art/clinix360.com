defmodule StitchConnect.Upload do
  alias Stitch.{Message}

  def presign_uploads(messages) do
    Enum.map(messages, fn
      %Message{type: "upload", fields: %{"url" => url}} = message ->
        filename =
          with %{path: path} <- URI.parse(url) do
            {:ok, Path.basename(path)}
          end

        case filename do
          {:ok, filename} ->
            fields = Map.put(message.fields, "presigned_url", presign(filename))
            Map.put(message, :fields, fields)
          _ ->
            message
        end

      message ->
        message
    end)
  end

  def presign(filename) do
    case Application.get_env(:stitch_connect, :env) do
      :test ->
        "temporary fallback value"
      env ->
        config = %{
          access_key_id: System.get_env("AWS_ACCESS_KEY_ID"),
          secret_access_key: System.get_env("AWS_SECRET_ACCESS_KEY"),
          region: System.get_env("S3_REGION"),
          scheme: "https://",
          host: "s3.#{System.get_env("S3_REGION")}.amazonaws.com",
        }

        url = ExAws.S3.presigned_url(config, :get, System.get_env("S3_BUCKET_NAME"), filename, [
          virtual_host: false,
          expires_in: 60_000,
        ])

        case url do
          {:ok, url} -> url
          _ -> nil
        end
    end
  end
end
