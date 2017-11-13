defmodule Stitch.Upload do
  alias ExAws.S3
  alias Stitch.{Message}

  @s3 Application.get_env(:stitch, :aws_user_upload)

  def presign(message, config \\ @s3)
  def presign(%Message{type: "upload", fields: %{"url" => url}}, config) do
    presign_url(url, config)
  end
  def presign(_message, _config), do: :error

  def presign_url(url, config \\ @s3) do
    with %{path: path} <- URI.parse(url),
         object = Path.basename(path),
         {:ok, presigned_url} <- presign_object(object, config) do
      {:ok, presigned_url}
    end
  end

  def presign_object(object, %{bucket: bucket} = config) when is_binary(object) and is_binary(bucket) do
    url = S3.presigned_url(config, :get, bucket, object, virtual_host: false, expires_in: 60_000)

    case url do
      {:ok, presigned_url} -> {:ok, presigned_url}
      _ -> :error
    end
  end
  def presign_object(_object, _config), do: :error
end
