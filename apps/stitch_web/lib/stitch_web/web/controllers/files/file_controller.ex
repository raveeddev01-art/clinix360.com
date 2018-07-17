defmodule Stitch.Web.Files.FileController do
  use Stitch.Web, :controller

  alias Stitch.{
    Message,
    Accounts.User,
    UserQueries,
    Files.Upload,
    Files.FileQueries,
    Files.FileAuthorization,
    Web.UrlService
  }

  def download(conn, %{"file_id" => "f" <> _ = encoded_file_id} = params) do
    with {:file_id, {:ok, file_id}} <- {:file_id, Upload.decode_url_id(encoded_file_id)},
         {:file, %Upload{} = file} <-
           {:file, FileQueries.get_by_id(file_id, preload_assoc: true)},
         {:authenticated, true} <- authenticated(conn, file, params) do
      stream_full_file(conn, file)
    else
      {:authenticated, false, upload} ->
        conn
        |> put_session(:redirect_url, UrlService.file_download_url(upload))
        |> redirect(external: UrlService.team_login_url(upload))
        |> halt

      _ ->
        conn
        |> redirect(external: UrlService.login_url())
        |> halt
    end
  end

  def download_preview(conn, %{"file_id" => "f" <> _ = encoded_file_id} = params) do
    redirect_url = Path.join([conn.host, conn.request_path])

    with {:file_id, {:ok, file_id}} <- {:file_id, Upload.decode_url_id(encoded_file_id)},
         {:file, %Upload{} = file} <-
           {:file, FileQueries.get_by_id(file_id, preload_assoc: true)},
         {:has_preview?, true} <- {:has_preview?, Upload.has_preview?(file)},
         {:authenticated, true} <- authenticated(conn, file, params) do
      stream_preview(conn, file)
    else
      {:authenticated, false, upload} ->
        conn
        |> put_session(:redirect_url, UrlService.file_download_url(upload))
        |> redirect(external: UrlService.team_login_url(upload))
        |> halt

      _ ->
        conn
        |> put_session(:redirect_url, redirect_url)
        |> redirect(external: UrlService.login_url())
        |> halt
    end
  end

  @spec authenticated(Conn.t(), Upload.t(), map) ::
          {:authenticated, boolean} | {:authenticated, boolean, Upload.t() | Message.t()}

  def authenticated(_conn, %Upload{public_token: token}, %{"public_token" => token}),
    do: {:authenticated, true}

  def authenticated(conn, %Upload{} = upload, params) do
    with {:user_token, user_token} when is_binary(user_token) <-
           {:user_token,
            get_user_token_from_team(conn, upload.team_id) || params["authenticationToken"]},
         {:team_user, current_user = %User{}} <-
           {:team_user, UserQueries.team_member_by_token(upload.team_id, user_token)},
         {:authenticated, true} <-
           {:authenticated, FileAuthorization.can_view?(upload, current_user)} do
      {:authenticated, true}
    else
      _ -> {:authenticated, false, upload}
    end
  end

  @spec put_cache_header(Conn.t(), Upload.t()) :: {:fresh, Conn.t()} | {:stale, Conn.t()}
  def put_cache_header(conn, %Upload{} = file) do
    etag = generate_etag(file.filename)

    conn =
      conn
      |> put_resp_header("ETag", etag)
      |> put_mimetype(file)
      |> put_resp_header("Last-Modified", generate_last_modified(file))

    if etag in get_req_header(conn, "if-none-match") do
      {:fresh, conn}
    else
      {:stale, conn}
    end
  end

  def put_mimetype(conn, %{fields: %{"mimetype" => mimetype}}),
    do: put_resp_header(conn, "Content-Type", mimetype)

  def put_mimetype(conn, _upload), do: conn

  @spec stream_full_file(Conn.t(), Upload.t()) :: Conn.t()
  def stream_preview(conn, %Upload{} = upload) do
    stream_file(conn, upload, upload.preview_url)
  end

  @spec stream_full_file(Conn.t(), Upload.t()) :: Conn.t()
  def stream_full_file(conn, %Upload{} = upload) do
    stream_file(conn, upload, upload.url)
  end

  @spec stream_file(Conn.t(), Upload.t(), String.t()) :: Conn.t()
  def stream_file(conn, upload, url) do
    filename = Path.basename(url)

    case put_cache_header(conn, filename, upload) do
      {:stale, conn} ->
        conn
        |> put_resp_header("Content-Length", upload.size_in_bytes)
        |> send_chunked(200)
        |> Stitch.AWS.S3.stream(filename, fn conn, bytes ->
          case chunk(conn, bytes) do
            {:ok, conn} ->
              {:cont, conn}

            {:error, :closed} ->
              {:halt, conn}
          end
        end)

      {:fresh, conn} ->
        conn
        |> send_resp(304, "")
        |> halt
    end
  end

  defp generate_etag(filename) do
    res =
      filename
      |> Murmur.hash_x86_128()
      |> Integer.to_string(16)

    "W/ \"" <> res <> "\""
  end

  defp generate_last_modified(upload) do
    upload
    |> PhoenixETag.schema_last_modified()
    |> NaiveDateTime.to_erl()
    |> :phoenix_etag_date.rfc1123()
  end

  def put_cache_header(conn, filename, upload) do
    etag = generate_etag(filename)

    conn =
      conn
      |> put_resp_header("ETag", etag)
      |> put_mimetype(upload)
      |> put_resp_header("Last-Modified", generate_last_modified(upload))

    if etag in get_req_header(conn, "if-none-match") do
      {:fresh, conn}
    else
      {:stale, conn}
    end
  end
end
