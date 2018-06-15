defmodule Stitch.Web.Files.FileController do
  use Stitch.Web, :controller

  alias Stitch.{
    MessageQueries,
    GroupAuthorization,
    Message,
    Accounts.User,
    UserQueries,
    Files.Upload,
    Files.FileQueries,
    Files.FileAuthorization
  }

  def download(conn, %{"file_id" => "f" <> _ = encoded_file_id}) do
    with {:file_id, {:ok, file_id}} <- {:file_id, Upload.decode_url_id(encoded_file_id)},
         {:file, %Upload{} = file} <-
           {:file, FileQueries.get_by_id(file_id, preload_assoc: true)},
         {:authenticated, true} <- authenticated(conn, file) do
      stream_full_file(conn, file)
    else
      {:authenticated, false, upload} ->
        conn
        |> put_session(:redirect_url, conn.request_path)
        |> redirect(external: login_url(upload))
        |> halt

      _ ->
        conn
        |> put_session(:redirect_url, conn.request_path)
        |> redirect(external: login_url())
        |> halt
    end
  end

  def download_preview(conn, %{"file_id" => "f" <> _ = encoded_file_id}) do
    with {:file_id, {:ok, file_id}} <- {:file_id, Upload.decode_url_id(encoded_file_id)},
         {:file, %Upload{} = file} <-
           {:file, FileQueries.get_by_id(file_id, preload_assoc: true)},
         {:has_preview?, true} <- {:has_preview?, Upload.has_preview?(file)},
         {:authenticated, true} <- authenticated(conn, file) do
      stream_preview(conn, file)
    else
      {:authenticated, false, upload} ->
        conn
        |> put_session(:redirect_url, conn.request_path)
        |> redirect(external: login_url(upload))
        |> halt

      _ ->
        conn
        |> put_session(:redirect_url, conn.request_path)
        |> redirect(external: login_url())
        |> halt
    end
  end

  def authenticated(conn, %Upload{} = file) do
    with {:user_token, user_token} when is_binary(user_token) <-
           {:user_token, get_user_token_from_team(conn, file.team_id)},
         {:team_user, current_user = %User{}} <-
           {:team_user, UserQueries.team_member_by_token(file.team_id, user_token)},
         {:authenticated, true} <-
           {:authenticated, FileAuthorization.can_view?(file, current_user)} do
      {:authenticated, true}
    else
      _ -> {:authenticated, false, file}
    end
  end

  def authenticated(conn, upload) do
    with {:user_token, user_token} when is_binary(user_token) <-
           {:user_token, get_user_token_from_team(conn, upload.group.team_id)},
         {:team_user, current_user = %User{}} <-
           {:team_user, UserQueries.team_member_by_token(upload.group.team_id, user_token)},
         {:authenticated, true} <-
           {:authenticated, GroupAuthorization.can_view?(upload.group, current_user)} do
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
  def stream_preview(conn, %Upload{} = file) do
    stream_file(conn, file)
  end

  @spec stream_full_file(Conn.t(), Upload.t()) :: Conn.t()
  def stream_full_file(conn, %Upload{} = file) do
    stream_file(conn, file)
  end

  @spec stream_file(Conn.t(), Upload.t()) :: Conn.t()
  def stream_file(conn, %Upload{} = file) do
    filename = Path.basename(file.url)

    case put_cache_header(conn, file) do
      {:stale, conn} ->
        conn
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

  defp valid_upload?(%{"url" => url}) when is_binary(url), do: true
  defp valid_upload?(_upload), do: false

  defp valid_upload_with_preview?(%{"url" => url, "preview_url" => preview_url})
       when is_binary(url) and is_binary(preview_url),
       do: true

  defp valid_upload_with_preview?(_upload), do: false

  # Redirect to the team login page. The team is inferred from the message.
  defp login_url(%Upload{team_id: team_id}) do
    team = Stitch.TeamQueries.get_by_id(team_id)
    struct_url = Stitch.Web.Endpoint.struct_url()
    struct_url = %{struct_url | host: "#{team.slug}.#{struct_url.host}"}
    Stitch.Web.SubdomainRouter.Helpers.authentication_url(struct_url, :login)
  end

  defp login_url(%Message{group: %{team_id: team_id}}) do
    team = Stitch.TeamQueries.get_by_id(team_id)
    struct_url = Stitch.Web.Endpoint.struct_url()
    struct_url = %{struct_url | host: "#{team.slug}.#{struct_url.host}"}
    Stitch.Web.SubdomainRouter.Helpers.authentication_url(struct_url, :login)
  end

  defp login_url(_upload), do: login_url()

  defp login_url() do
    struct_url = Stitch.Web.Endpoint.struct_url()
    Stitch.Web.Router.Helpers.authentication_url(struct_url, :index)
  end

  #
  # Temporary actions to support the old format in case the migration takes too long.
  # Will be removed in the next release.
  #
  def download(conn, %{"file_id" => upload_id}) do
    with {:upload, upload = %Message{}} <- {:upload, MessageQueries.get_by_id(upload_id)},
         {:valid?, true} <- {:valid?, valid_upload?(upload.fields)},
         {:authenticated, true} <- authenticated(conn, upload) do
      %{fields: %{"url" => url}} = upload
      stream_file(conn, url, upload)
    else
      {:authenticated, false, upload} ->
        conn
        |> put_session(:redirect_url, conn.request_path)
        |> redirect(external: login_url(upload))
        |> halt

      _ ->
        conn
        |> put_session(:redirect_url, conn.request_path)
        |> redirect(external: login_url())
        |> halt
    end
  end

  def download_preview(conn, %{"file_id" => upload_id}) do
    with {:upload, upload = %Message{}} <- {:upload, MessageQueries.get_by_id(upload_id)},
         {:valid?, true} <- {:valid?, valid_upload_with_preview?(upload.fields)},
         {:authenticated, true} <- authenticated(conn, upload) do
      %{fields: %{"preview_url" => url}} = upload
      stream_file(conn, url, upload)
    else
      {:authenticated, false, upload} ->
        conn
        |> put_session(:redirect_url, conn.request_path)
        |> redirect(external: login_url(upload))
        |> halt

      _ ->
        conn
        |> put_session(:redirect_url, conn.request_path)
        |> redirect(external: login_url())
        |> halt
    end
  end

  def stream_file(conn, url, upload) do
    filename = Path.basename(url)

    case put_cache_header(conn, filename, upload) do
      {:stale, conn} ->
        conn
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
