defmodule Stitch.AWS.S3 do
  alias Timex
  @s3 Application.get_env(:stitch, :aws_user_upload)
  require Logger

  @spec upload(binary) :: {:ok, map} | {:error, term}
  def upload(path) do
    object_name = Path.basename(path)

    path
    |> ExAws.S3.Upload.stream_file()
    |> ExAws.S3.upload(@s3.bucket, object_name, encryption: "AES256")
    |> ExAws.request()
  end

  @spec download(binary, binary) :: {:ok, :done} | {:error, term}
  def download(filename, dest) do
    ExAws.S3.download_file(@s3.bucket, filename, dest) |> ExAws.request()
  end

  def fullpath(file \\ "", dir \\ "") do
    object = Path.join(dir, Path.basename(file))
    "#{@s3.scheme}#{@s3.host}/#{@s3.bucket}/#{object}"
  end

  @spec basepath(binary) :: {:ok, binary}
  def basepath(url) do
    with %{path: path} <- URI.parse(url) do
      {:ok, Path.relative_to(path, "/#{@s3.bucket}")}
    end
  end

  def presigned_url(object, opts \\ [expires_in: 60_000])

  def presigned_url(object, opts) when is_binary(object) do
    case presign(object, opts) do
      {:ok, presigned_url} -> presigned_url
      _ -> nil
    end
  end

  def presigned_url(_object, _opts), do: nil

  def presign(object, opts \\ [expires_in: 60_000])

  def presign(object, opts) when is_binary(object) do
    path = Path.basename(object)
    opts = Keyword.put(opts, :virtual_host, false)

    case ExAws.S3.presigned_url(@s3, :get, @s3.bucket, path, opts) do
      {:ok, presigned_url} -> {:ok, presigned_url}
      _ -> :error
    end
  end

  def presign(_object, _opts), do: :error

  def signature(filename, mimetype) do
    policy = policy(filename, mimetype)

    %{
      key: filename,
      acl: "private",
      policy: policy,
      action: fullpath(),
      "Content-Type": mimetype,
      success_action_status: "201",
      AWSAccessKeyId: @s3.access_key_id,
      signature: hmac_sha1(@s3.secret_access_key, policy)
    }
  end

  defp policy(key, mimetype, expiration_window \\ 60) do
    # Let's make this into JSON.
    # We also need to base64 encode it.
    %{
      # This policy is valid for an hour by default.
      expiration: now_plus(expiration_window),
      conditions: [
        # The uploaded file must be publicly readable.
        %{acl: "private"},
        # You can only upload to the bucket we specify.
        %{bucket: @s3.bucket},
        # You have to upload the mime type you said you would upload.
        ["starts-with", "$Content-Type", mimetype],
        %{"x-amz-server-side-encryption" => "AES256"},
        # You have to upload the file name you said you would upload.
        ["starts-with", "$key", key],
        # When things work out ok, AWS should send a 201 response.
        %{success_action_status: "201"},
        # For form fields that accept a range, separate the upper and lower limit with a comma.
        ["content-length-range", 0, @s3.upload_size_cap]
      ]
    }
    |> Poison.encode!()
    |> Base.encode64()
  end

  # TODO: Need to move to /stitch/libs/crypto
  defp hmac_sha1(secret, msg) do
    :crypto.hmac(:sha, secret, msg)
    |> Base.encode64()
  end

  defp now_plus(minutes) do
    Timex.now()
    |> Timex.shift(minutes: minutes)
    |> Timex.format!("{ISO:Extended:Z}")
  end
end