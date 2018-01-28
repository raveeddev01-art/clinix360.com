defmodule Stitch.AWS.S3 do
  alias Timex
  @s3 Application.get_env(:stitch, :aws_user_upload)

  def sign(filename, mimetype) do
    policy = policy(filename, mimetype)

    %{
      key: filename,
      acl: "private",
      policy: policy,
      "Content-Type": mimetype,
      success_action_status: "201",
      AWSAccessKeyId: @s3.access_key_id,
      action: "https://#{@s3.host}/#{@s3.bucket}/",
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
        %{success_action_status: "201"}
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
