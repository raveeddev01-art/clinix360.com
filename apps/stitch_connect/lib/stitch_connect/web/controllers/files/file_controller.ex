defmodule StitchConnect.Web.Files.FileController do
  use StitchConnect.Web, :controller
  alias Stitch.{MessageQueries, GroupAuthorization, Message}

  def stream(conn, %{"upload_id" => upload_id}) do
    current_user = conn.assigns.current_user

    with {:upload,
          upload = %Message{
            type: "upload",
            fields: %{"url" => url, "mimetype" => mimetype, "size_in_bytes" => size_in_bytes}
          }}
         when is_binary(url) and is_binary(mimetype) and is_integer(size_in_bytes) <-
           {:upload, MessageQueries.get_by_id(upload_id)},
         {:authenticated, true} <-
           {:authenticated, GroupAuthorization.can_view?(upload.group, current_user)} do
      stream_file(conn, upload)
    else
      _ ->
        conn
        |> put_session(:redirect_url, conn.request_path)
        |> redirect(to: "/login")
        |> halt
    end
  end

  def stream_file(
        conn,
        %{
          fields: %{"url" => url, "mimetype" => mimetype, "size_in_bytes" => size_in_bytes}
        } = upload
      ) do
    filename = Path.basename(url)

    conn =
      conn
      |> put_resp_header("cache-control", "public, max-age=31536000")
      |> put_resp_header("ETag", generate_etag(filename))
      |> put_resp_header("Last-Modified", generate_last_modified(upload))
      |> put_resp_header("Content-Type", mimetype)
      |> put_resp_header("Content-Length", size_in_bytes |> to_string())
      |> send_chunked(200)

    Stitch.AWS.S3.stream(filename, fn bytes ->
      chunk(conn, bytes)
    end)

    conn
  end

  def generate_etag(filename) do
    res =
      filename
      |> Murmur.hash_x86_128()
      |> Integer.to_string(16)

    "\"" <> res <> "\""
  end

  def generate_last_modified(upload) do
    PhoenixETag.schema_last_modified(upload)
    |> NaiveDateTime.to_erl()
    |> :phoenix_etag_date.rfc1123()
  end
end
