defmodule StitchConnect.Web.Api.V1.UploadController do
  use StitchConnect.Web, :controller

  def index(conn, params) do
    skip = Map.get(params, "skip", 0)
    limit = Map.get(params, "limit", 10)
    current_user = conn.assigns.current_user

    uploads = Stitch.MessageQueries.get_uploads_for_user(current_user, skip, limit)

    conn
    |> render("index.json", %{uploads: uploads, user_id: current_user.id})
  end

  def create(conn, %{"filename" => filename, "mimetype" => mimetype} = attrs) do
    conn
    |> put_status(:created)
    |> render("create.json", signature: sign(filename, mimetype, attrs["encoding"]))
  end

  defp sign(filename, mimetype, encoding) do
    policy = policy(filename, mimetype, encoding)

    attrs = %{
      key: filename,
      'Content-Type': mimetype,
      acl: "private",
      success_action_status: "201",
      action: "https://s3.amazonaws.com/#{System.get_env("S3_BUCKET_NAME")}",
      'AWSAccessKeyId': System.get_env("AWS_ACCESS_KEY_ID"),
      policy: policy,
      signature: hmac_sha1(System.get_env("AWS_SECRET_ACCESS_KEY"), policy)
    }

    if encoding do
      Map.put(attrs, 'Content-Encoding', encoding)
    else
      attrs
    end
  end

  defp now_plus(minutes) do
    import Timex
    now()
    |> shift(minutes: minutes)
    |> format!("{ISO:Extended:Z}")
  end

  defp hmac_sha1(secret, msg) do
    :crypto.hmac(:sha, secret, msg)
    |> Base.encode64
  end

  defp policy(key, mimetype, encoding) do
    expiration_window = 60
    attrs = %{
      # This policy is valid for an hour by default.
      expiration: now_plus(expiration_window),
      conditions: [
        # You can only upload to the bucket we specify.
        %{bucket: System.get_env("S3_BUCKET_NAME")},
        # The uploaded file must be publicly readable.
        %{acl: "private"},
        # You have to upload the mime type you said you would upload.
        ["starts-with", "$Content-Type", mimetype],
        %{"x-amz-server-side-encryption" => "AES256"},
        # You have to upload the file name you said you would upload.
        ["starts-with", "$key", key],
        # When things work out ok, AWS should send a 201 response.
        %{success_action_status: "201"}
      ]
    }

    attrs =
      if encoding do
        Map.put(attrs, 'Content-Encoding', encoding)
      else
        attrs
      end

    attrs
    |> Poison.encode!
    |> Base.encode64
  end
end
