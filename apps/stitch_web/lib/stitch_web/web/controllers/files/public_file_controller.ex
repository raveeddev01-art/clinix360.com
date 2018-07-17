defmodule Stitch.Web.Files.PublicFileController do
  use Stitch.Web, :controller

  alias Stitch.{
    Files.Upload,
    Files.FileQueries,
    Web.UrlService,
    Web.Files.PublicFileView
  }

  plug(:fetch_flash)
  plug(:protect_from_forgery)
  plug(:put_secure_browser_headers)

  def public_download(conn, %{"file_id" => "f" <> _ = encoded_ids} = _params) do
    with [encoded_file_id, url_public_token] <- String.split(encoded_ids, "-"),
         {:file_id, {:ok, file_id}} <- {:file_id, Upload.decode_url_id(encoded_file_id)},
         {:file, %Upload{public_token: file_public_token} = file}
         when not is_nil(file_public_token) <-
           {:file, FileQueries.get_by_id(file_id, preload_assoc: true)},
         {:authenticated, true} <- {:authenticated, url_public_token == file_public_token} do
      url = UrlService.file_download_url(file, %{public_token: file_public_token})

      app_params = %{
        url: url,
        file: file,
        icon: PublicFileView.get_filetype_icon(file)
      }

      conn
      |> put_layout("public_download_layout.html")
      |> assign(:title, file.filename)
      |> render("download_page.html", app_params: app_params)
    else
      _ ->
        conn
        |> put_status(:not_found)
        |> text("not found")
    end
  end
end
